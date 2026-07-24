import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './payment.schema';
import {
  BusinessDocument,
  BusinessDocumentDocument,
} from '../documents/document.schema';
import { PartiesService } from '../parties/parties.service';
import { NumberSequenceService } from '../company/number-sequence.service';
import { PaginationQueryDto, paginate } from '../../common/dto/pagination.dto';
import { escapeRegex } from '../../common/services/base-crud.service';

export interface CreatePaymentInput {
  type: 'in' | 'out';
  partyId: string;
  amount: number;
  mode: string;
  date: string;
  allocations?: { documentId: string; amount: number }[];
  reference?: string;
  note?: string;
  /** auto-allocate FIFO against oldest open documents */
  autoAllocate?: boolean;
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(BusinessDocument.name) private docModel: Model<BusinessDocumentDocument>,
    @InjectConnection() private connection: Connection,
    private parties: PartiesService,
    private numberSeq: NumberSequenceService,
    private events: EventEmitter2,
  ) {}

  async list(
    companyId: string,
    query: PaginationQueryDto & { type?: string; partyId?: string; mode?: string; from?: string; to?: string },
  ) {
    const { page = 1, limit = 20, search, type, partyId, mode, from, to } = query;
    const filter: Record<string, unknown> = {
      companyId: new Types.ObjectId(companyId),
      deletedAt: null,
    };
    if (type) filter.type = type;
    if (partyId) filter.partyId = new Types.ObjectId(partyId);
    if (mode) filter.mode = mode;
    if (from || to) {
      const range: Record<string, Date> = {};
      if (from) range.$gte = new Date(from);
      if (to) range.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
      filter.date = range;
    }
    if (search) {
      filter.$or = [
        { number: { $regex: escapeRegex(search), $options: 'i' } },
        { partyName: { $regex: escapeRegex(search), $options: 'i' } },
        { reference: { $regex: escapeRegex(search), $options: 'i' } },
      ];
    }

    const [data, total, sums] = await Promise.all([
      this.paymentModel
        .find(filter)
        .sort({ date: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.paymentModel.countDocuments(filter),
      this.paymentModel.aggregate([
        { $match: filter },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
    ]);

    const summary = { received: 0, paid: 0 };
    for (const s of sums) {
      if (s._id === 'in') summary.received = s.total;
      else summary.paid = s.total;
    }
    return { ...paginate(data, total, page, limit), summary };
  }

  async findOne(companyId: string, id: string) {
    const payment = await this.paymentModel
      .findOne({ _id: id, companyId: new Types.ObjectId(companyId), deletedAt: null })
      .lean();
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async create(companyId: string, userId: string, input: CreatePaymentInput) {
    if (input.amount <= 0) throw new BadRequestException('Amount must be positive');

    const session = await this.connection.startSession();
    try {
      let created: PaymentDocument | undefined;
      await session.withTransaction(async () => {
        const party = await this.parties.findOne(companyId, input.partyId);

        // Build allocations
        let allocations = (input.allocations ?? []).map((a) => ({
          documentId: new Types.ObjectId(a.documentId),
          amount: a.amount,
        }));

        const docTypes = input.type === 'in' ? ['invoice', 'sales-return'] : ['purchase-bill', 'purchase-return'];

        if (input.autoAllocate && allocations.length === 0) {
          // FIFO against oldest open docs
          const openDocs = await this.docModel
            .find({
              companyId: new Types.ObjectId(companyId),
              partyId: new Types.ObjectId(input.partyId),
              docType: { $in: input.type === 'in' ? ['invoice'] : ['purchase-bill'] },
              status: { $in: ['unpaid', 'partial'] },
              deletedAt: null,
            })
            .sort({ date: 1 })
            .session(session);

          let remaining = input.amount;
          for (const doc of openDocs) {
            if (remaining <= 0) break;
            const take = Math.min(remaining, doc.balanceAmount);
            allocations.push({ documentId: doc._id as Types.ObjectId, amount: take });
            remaining -= take;
          }
        }

        const allocatedTotal = allocations.reduce((s, a) => s + a.amount, 0);
        if (allocatedTotal > input.amount + 0.01) {
          throw new BadRequestException('Allocations exceed payment amount');
        }

        // Apply allocations to documents
        const enriched: { documentId: Types.ObjectId; documentNumber?: string; docType?: string; amount: number }[] = [];
        for (const alloc of allocations) {
          const doc = await this.docModel
            .findOne({
              _id: alloc.documentId,
              companyId: new Types.ObjectId(companyId),
              docType: { $in: docTypes },
              deletedAt: null,
            })
            .session(session);
          if (!doc) throw new NotFoundException(`Document not found: ${alloc.documentId}`);
          if (alloc.amount > doc.balanceAmount + 0.01) {
            throw new BadRequestException(
              `Allocation ${alloc.amount} exceeds balance ${doc.balanceAmount} on ${doc.number}`,
            );
          }
          doc.paidAmount = Math.round((doc.paidAmount + alloc.amount) * 100) / 100;
          doc.balanceAmount = Math.round((doc.grandTotal - doc.paidAmount) * 100) / 100;
          doc.payments.push({ mode: input.mode, amount: alloc.amount, reference: input.reference });
          doc.status = doc.balanceAmount <= 0.009 ? 'paid' : 'partial';
          if (doc.status === 'paid') {
            doc.balanceAmount = 0;
            doc.isLocked = true;
          }
          await doc.save({ session });
          enriched.push({
            documentId: doc._id as Types.ObjectId,
            documentNumber: doc.number,
            docType: doc.docType,
            amount: alloc.amount,
          });
        }

        // Party balance: full payment amount reduces outstanding
        const direction = input.type === 'in' ? -1 : -1; // both reduce what's owed on their side
        await this.parties.adjustBalance(companyId, input.partyId, direction * input.amount, session);

        const number = await this.numberSeq.nextNumber(companyId, 'payment', session);

        const [payment] = await this.paymentModel.create(
          [
            {
              companyId: new Types.ObjectId(companyId),
              number,
              type: input.type,
              partyId: new Types.ObjectId(input.partyId),
              partyName: party.name,
              amount: input.amount,
              mode: input.mode,
              date: new Date(input.date),
              allocations: enriched,
              advanceAmount: Math.round((input.amount - allocatedTotal) * 100) / 100,
              reference: input.reference,
              note: input.note,
              createdBy: new Types.ObjectId(userId),
            },
          ],
          { session },
        );
        created = payment;
      });

      this.events.emit('payment.created', { companyId, paymentId: String(created!._id) });
      return created!.toObject();
    } finally {
      await session.endSession();
    }
  }

  /** Delete payment → roll back allocations and party balance */
  async remove(companyId: string, id: string) {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const payment = await this.paymentModel
          .findOne({ _id: id, companyId: new Types.ObjectId(companyId), deletedAt: null })
          .session(session);
        if (!payment) throw new NotFoundException('Payment not found');

        for (const alloc of payment.allocations) {
          const doc = await this.docModel
            .findOne({ _id: alloc.documentId, companyId: new Types.ObjectId(companyId) })
            .session(session);
          if (!doc) continue;
          doc.paidAmount = Math.max(0, Math.round((doc.paidAmount - alloc.amount) * 100) / 100);
          doc.balanceAmount = Math.round((doc.grandTotal - doc.paidAmount) * 100) / 100;
          doc.status = doc.paidAmount <= 0.009 ? 'unpaid' : 'partial';
          doc.isLocked = false;
          await doc.save({ session });
        }

        await this.parties.adjustBalance(companyId, payment.partyId, payment.amount, session);

        payment.deletedAt = new Date();
        await payment.save({ session });
      });
      return { deleted: true };
    } finally {
      await session.endSession();
    }
  }
}
