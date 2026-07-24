import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import {
  BALANCE_EFFECT,
  BusinessDocument,
  BusinessDocumentDocument,
  DocType,
  STOCK_EFFECT,
} from './document.schema';
import { CreateDocumentDto, DocumentListQueryDto } from './document.dto';
import { NumberSequenceService } from '../company/number-sequence.service';
import { InventoryService, StockChange } from '../inventory/inventory.service';
import { PartiesService } from '../parties/parties.service';
import { Company, CompanyDocument } from '../company/company.schema';
import { Product, ProductDocument } from '../catalog/product.schema';
import { calcDocument, isInterState } from '../../common/utils/tax-engine';
import { paginate } from '../../common/dto/pagination.dto';
import { escapeRegex } from '../../common/services/base-crud.service';

const OPEN_STATUSES = ['unpaid', 'partial'];

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(BusinessDocument.name)
    private docModel: Model<BusinessDocumentDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectConnection() private connection: Connection,
    private numberSeq: NumberSequenceService,
    private inventory: InventoryService,
    private parties: PartiesService,
    private events: EventEmitter2,
  ) {}

  // ------------------------------------------------------------------ list

  async list(companyId: string, docType: DocType, query: DocumentListQueryDto) {
    const { page = 1, limit = 20, search, status, partyId, from, to, sortBy = 'date', sortOrder = 'desc' } = query;
    const filter: Record<string, unknown> = {
      companyId: new Types.ObjectId(companyId),
      docType,
      deletedAt: null,
    };
    if (status) filter.status = status;
    if (partyId) filter.partyId = new Types.ObjectId(partyId);
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
        { referenceNumber: { $regex: escapeRegex(search), $options: 'i' } },
      ];
    }

    const [data, total, totals] = await Promise.all([
      this.docModel
        .find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-items -versionHistory')
        .lean(),
      this.docModel.countDocuments(filter),
      this.docModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            grandTotal: { $sum: '$grandTotal' },
            paidAmount: { $sum: '$paidAmount' },
            balanceAmount: { $sum: '$balanceAmount' },
          },
        },
      ]),
    ]);

    return {
      ...paginate(data, total, page, limit),
      summary: totals[0] ?? { grandTotal: 0, paidAmount: 0, balanceAmount: 0 },
    };
  }

  async findOne(companyId: string, docType: DocType, id: string) {
    const doc = await this.docModel
      .findOne({ _id: id, companyId: new Types.ObjectId(companyId), docType, deletedAt: null })
      .lean();
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async nextNumber(companyId: string, docType: DocType) {
    return { number: await this.numberSeq.peekNumber(companyId, docType) };
  }

  // ------------------------------------------------------------------ create

  async create(companyId: string, userId: string, docType: DocType, dto: CreateDocumentDto) {
    if (!dto.items?.length && !dto.isDraft) {
      throw new BadRequestException('At least one item is required');
    }

    const company = await this.companyModel.findById(companyId).lean();
    if (!company) throw new NotFoundException('Company not found');

    const session = await this.connection.startSession();
    try {
      let created: BusinessDocumentDocument | undefined;
      await session.withTransaction(async () => {
        const number =
          dto.number?.trim() || (await this.numberSeq.nextNumber(companyId, docType, session));

        const computed = await this.computeDocument(companyId, company, dto, session);

        const status = this.initialStatus(docType, dto, computed.balanceAmount);

        const [doc] = await this.docModel.create(
          [
            {
              companyId: new Types.ObjectId(companyId),
              docType,
              number,
              date: new Date(dto.date),
              dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
              partyId: dto.partyId ? new Types.ObjectId(dto.partyId) : undefined,
              partyName: dto.partyName,
              partyPhone: dto.partyPhone,
              partyEmail: dto.partyEmail,
              partyGstin: dto.partyGstin,
              billingAddress: dto.billingAddress ?? {},
              shippingAddress: dto.shippingAddress ?? {},
              referenceNumber: dto.referenceNumber,
              salesPerson: dto.salesPerson,
              paymentTerms: dto.paymentTerms,
              notes: dto.notes,
              terms: dto.terms ?? company.termsAndConditions,
              extra: dto.extra ?? {},
              status,
              createdBy: new Types.ObjectId(userId),
              againstDocId: dto.againstDocId ? new Types.ObjectId(dto.againstDocId) : undefined,
              ...computed,
            },
          ],
          { session },
        );
        created = doc;

        if (status !== 'draft') {
          await this.applyEffects(companyId, userId, doc, session, company.negativeStockAllowed);
        }
      });

      const doc = created!;
      this.events.emit(`${docType}.created`, { companyId, docId: String(doc._id) });
      return doc.toObject();
    } finally {
      await session.endSession();
    }
  }

  // ------------------------------------------------------------------ update

  async update(companyId: string, userId: string, userName: string, docType: DocType, id: string, dto: CreateDocumentDto) {
    const company = await this.companyModel.findById(companyId).lean();
    if (!company) throw new NotFoundException('Company not found');

    const session = await this.connection.startSession();
    try {
      let updated: BusinessDocumentDocument | undefined;
      await session.withTransaction(async () => {
        const doc = await this.docModel
          .findOne({ _id: id, companyId: new Types.ObjectId(companyId), docType, deletedAt: null })
          .session(session);
        if (!doc) throw new NotFoundException('Document not found');
        if (doc.isLocked) throw new BadRequestException('Document is locked (fully paid). Unlock it before editing.');
        if (doc.status === 'cancelled') throw new BadRequestException('Cancelled documents cannot be edited');

        const wasEffective = doc.status !== 'draft';

        // snapshot old version
        doc.versionHistory.push({
          at: new Date(),
          by: new Types.ObjectId(userId),
          byName: userName,
          snapshot: {
            items: doc.items,
            grandTotal: doc.grandTotal,
            status: doc.status,
            date: doc.date,
            partyName: doc.partyName,
          },
        });

        // reverse old effects
        if (wasEffective) {
          await this.reverseEffects(companyId, userId, doc, session);
        }

        const computed = await this.computeDocument(companyId, company, dto, session);
        const status = this.initialStatus(docType, dto, computed.balanceAmount);

        Object.assign(doc, {
          date: new Date(dto.date),
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          partyId: dto.partyId ? new Types.ObjectId(dto.partyId) : undefined,
          partyName: dto.partyName,
          partyPhone: dto.partyPhone,
          partyEmail: dto.partyEmail,
          partyGstin: dto.partyGstin,
          billingAddress: dto.billingAddress ?? {},
          shippingAddress: dto.shippingAddress ?? {},
          referenceNumber: dto.referenceNumber,
          salesPerson: dto.salesPerson,
          paymentTerms: dto.paymentTerms,
          notes: dto.notes,
          terms: dto.terms,
          extra: { ...doc.extra, ...(dto.extra ?? {}) },
          status,
          ...computed,
        });

        await doc.save({ session });

        if (status !== 'draft') {
          await this.applyEffects(companyId, userId, doc, session, company.negativeStockAllowed);
        }
        updated = doc;
      });

      this.events.emit(`${docType}.updated`, { companyId, docId: id });
      return updated!.toObject();
    } finally {
      await session.endSession();
    }
  }

  // ------------------------------------------------------------------ status ops

  async cancel(companyId: string, userId: string, docType: DocType, id: string) {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const doc = await this.docModel
          .findOne({ _id: id, companyId: new Types.ObjectId(companyId), docType, deletedAt: null })
          .session(session);
        if (!doc) throw new NotFoundException('Document not found');
        if (doc.status === 'cancelled') throw new BadRequestException('Already cancelled');
        if (doc.paidAmount > 0) {
          throw new BadRequestException('Document has payments. Remove payments before cancelling.');
        }

        if (doc.status !== 'draft') {
          await this.reverseEffects(companyId, userId, doc, session);
        }
        doc.status = 'cancelled';
        doc.isLocked = false;
        await doc.save({ session });
      });
      this.events.emit(`${docType}.cancelled`, { companyId, docId: id });
      return { cancelled: true };
    } finally {
      await session.endSession();
    }
  }

  async softDelete(companyId: string, userId: string, docType: DocType, id: string) {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const doc = await this.docModel
          .findOne({ _id: id, companyId: new Types.ObjectId(companyId), docType, deletedAt: null })
          .session(session);
        if (!doc) throw new NotFoundException('Document not found');
        if (doc.paidAmount > 0) {
          throw new BadRequestException('Document has payments. Remove payments before deleting.');
        }
        if (doc.status !== 'draft' && doc.status !== 'cancelled') {
          await this.reverseEffects(companyId, userId, doc, session);
        }
        doc.deletedAt = new Date();
        await doc.save({ session });
      });
      return { deleted: true };
    } finally {
      await session.endSession();
    }
  }

  /** Record an inline payment against the document (also used by "Mark Paid") */
  async recordPayment(
    companyId: string,
    userId: string,
    docType: DocType,
    id: string,
    payment: { mode: string; amount?: number; reference?: string },
    session?: ClientSession,
  ) {
    const run = async (s: ClientSession) => {
      const doc = await this.docModel
        .findOne({ _id: id, companyId: new Types.ObjectId(companyId), docType, deletedAt: null })
        .session(s);
      if (!doc) throw new NotFoundException('Document not found');
      if (doc.status === 'cancelled' || doc.status === 'draft') {
        throw new BadRequestException(`Cannot record payment on a ${doc.status} document`);
      }

      const amount = payment.amount ?? doc.balanceAmount;
      if (amount <= 0) throw new BadRequestException('Payment amount must be positive');
      if (amount > doc.balanceAmount + 0.01) {
        throw new BadRequestException(`Amount exceeds balance (${doc.balanceAmount})`);
      }

      doc.payments.push({ mode: payment.mode, amount, reference: payment.reference });
      doc.paidAmount = Math.round((doc.paidAmount + amount) * 100) / 100;
      doc.balanceAmount = Math.round((doc.grandTotal - doc.paidAmount) * 100) / 100;
      doc.status = doc.balanceAmount <= 0.009 ? 'paid' : 'partial';
      if (doc.status === 'paid') {
        doc.balanceAmount = 0;
        doc.isLocked = true;
      }
      await doc.save({ session: s });

      // reduce party outstanding
      if (doc.partyId && BALANCE_EFFECT[doc.docType]) {
        await this.parties.adjustBalance(companyId, doc.partyId, -amount * BALANCE_EFFECT[doc.docType], s);
      }
      return doc;
    };

    if (session) return (await run(session)).toObject();

    const s = await this.connection.startSession();
    try {
      let result: BusinessDocumentDocument | undefined;
      await s.withTransaction(async () => {
        result = await run(s);
      });
      this.events.emit('payment.received', { companyId, docId: id });
      return result!.toObject();
    } finally {
      await s.endSession();
    }
  }

  async setStatus(companyId: string, docType: DocType, id: string, status: string) {
    const allowed: Record<string, string[]> = {
      estimate: ['pending', 'accepted', 'rejected', 'expired'],
      challan: ['pending', 'delivered'],
      'purchase-order': ['pending', 'cancelled'],
    };
    if (!allowed[docType]?.includes(status)) {
      throw new BadRequestException(`Invalid status "${status}" for ${docType}`);
    }
    const doc = await this.docModel.findOneAndUpdate(
      { _id: id, companyId: new Types.ObjectId(companyId), docType, deletedAt: null },
      { $set: { status } },
      { new: true },
    );
    if (!doc) throw new NotFoundException('Document not found');
    return doc.toObject();
  }

  async toggleLock(companyId: string, docType: DocType, id: string, locked: boolean) {
    const doc = await this.docModel.findOneAndUpdate(
      { _id: id, companyId: new Types.ObjectId(companyId), docType, deletedAt: null },
      { $set: { isLocked: locked } },
      { new: true },
    );
    if (!doc) throw new NotFoundException('Document not found');
    return doc.toObject();
  }

  // ------------------------------------------------------------------ convert / duplicate

  /** estimate→invoice, challan→invoice, purchase-order→purchase-bill */
  async convert(companyId: string, userId: string, fromType: DocType, id: string) {
    const targets: Partial<Record<DocType, DocType>> = {
      estimate: 'invoice',
      proforma: 'invoice',
      challan: 'invoice',
      'purchase-order': 'purchase-bill',
    };
    const toType = targets[fromType];
    if (!toType) throw new BadRequestException(`Cannot convert a ${fromType}`);

    const source = await this.findOne(companyId, fromType, id);
    if (source.convertedTo) throw new BadRequestException('Already converted');

    const dto: CreateDocumentDto = {
      date: new Date().toISOString(),
      partyId: source.partyId ? String(source.partyId) : undefined,
      partyName: source.partyName,
      partyPhone: source.partyPhone,
      partyEmail: source.partyEmail,
      partyGstin: source.partyGstin,
      billingAddress: source.billingAddress,
      shippingAddress: source.shippingAddress,
      referenceNumber: source.number,
      salesPerson: source.salesPerson,
      paymentTerms: source.paymentTerms,
      items: source.items.map((i) => ({
        productId: i.productId ? String(i.productId) : undefined,
        name: i.name,
        hsn: i.hsn,
        qty: i.qty,
        unitId: i.unitId ? String(i.unitId) : undefined,
        unitName: i.unitName,
        price: i.price,
        taxInclusive: i.taxInclusive,
        discountType: i.discountType,
        discountValue: i.discountValue,
        taxRate: i.taxRate,
        cessRate: i.cessRate,
      })),
      docDiscountType: source.docDiscountType,
      docDiscountValue: source.docDiscountValue,
      shippingCharge: source.shippingCharge,
      packingCharge: source.packingCharge,
      otherCharge: source.otherCharge,
      notes: source.notes,
      terms: source.terms,
    };

    const created = await this.create(companyId, userId, toType, dto);

    await this.docModel.updateOne(
      { _id: id },
      {
        $set: {
          convertedTo: created._id,
          convertedToType: toType,
          status: 'converted',
        },
      },
    );
    await this.docModel.updateOne(
      { _id: created._id },
      { $set: { convertedFrom: new Types.ObjectId(id), convertedFromType: fromType } },
    );

    return created;
  }

  async duplicate(companyId: string, userId: string, docType: DocType, id: string) {
    const source = await this.findOne(companyId, docType, id);
    const dto: CreateDocumentDto = {
      date: new Date().toISOString(),
      partyId: source.partyId ? String(source.partyId) : undefined,
      partyName: source.partyName,
      partyPhone: source.partyPhone,
      partyEmail: source.partyEmail,
      partyGstin: source.partyGstin,
      billingAddress: source.billingAddress,
      shippingAddress: source.shippingAddress,
      salesPerson: source.salesPerson,
      paymentTerms: source.paymentTerms,
      items: source.items.map((i) => ({
        productId: i.productId ? String(i.productId) : undefined,
        name: i.name,
        hsn: i.hsn,
        qty: i.qty,
        unitId: i.unitId ? String(i.unitId) : undefined,
        unitName: i.unitName,
        price: i.price,
        taxInclusive: i.taxInclusive,
        discountType: i.discountType,
        discountValue: i.discountValue,
        taxRate: i.taxRate,
        cessRate: i.cessRate,
      })),
      docDiscountType: source.docDiscountType,
      docDiscountValue: source.docDiscountValue,
      shippingCharge: source.shippingCharge,
      packingCharge: source.packingCharge,
      otherCharge: source.otherCharge,
      notes: source.notes,
      terms: source.terms,
      isDraft: true,
    };
    return this.create(companyId, userId, docType, dto);
  }

  /** Open (unpaid/partial) docs for payment allocation */
  async openDocuments(companyId: string, partyId: string, docTypes: DocType[]) {
    return this.docModel
      .find({
        companyId: new Types.ObjectId(companyId),
        partyId: new Types.ObjectId(partyId),
        docType: { $in: docTypes },
        status: { $in: OPEN_STATUSES },
        deletedAt: null,
      })
      .sort({ date: 1 })
      .select('number date docType grandTotal paidAmount balanceAmount')
      .lean();
  }

  // ------------------------------------------------------------------ internals

  private initialStatus(docType: DocType, dto: CreateDocumentDto, balance: number): string {
    if (dto.isDraft) return 'draft';
    switch (docType) {
      case 'estimate':
      case 'proforma':
        return 'pending';
      case 'challan':
        return 'pending';
      case 'purchase-order':
        return 'pending';
      default:
        return balance <= 0.009 ? 'paid' : (dto.payments?.length ? 'partial' : 'unpaid');
    }
  }

  /** Compute totals + item snapshots. Fetches product costs for profit. */
  private async computeDocument(
    companyId: string,
    company: Company,
    dto: CreateDocumentDto,
    session: ClientSession,
  ) {
    const interState = isInterState(company.gstin, dto.partyGstin);

    // load product cost snapshots
    const productIds = dto.items.filter((i) => i.productId).map((i) => new Types.ObjectId(i.productId));
    const products = productIds.length
      ? await this.productModel
          .find({ _id: { $in: productIds }, companyId: new Types.ObjectId(companyId) })
          .select('purchasePrice')
          .session(session)
          .lean()
      : [];
    const costMap = new Map(products.map((p) => [String(p._id), p.purchasePrice ?? 0]));

    const paidAmount = (dto.payments ?? []).reduce((s, p) => s + (p.amount || 0), 0);

    const totals = calcDocument({
      lines: dto.items.map((i) => ({
        qty: i.qty,
        price: i.price,
        discountType: i.discountType,
        discountValue: i.discountValue,
        taxRate: i.taxRate,
        cessRate: i.cessRate,
        taxInclusive: i.taxInclusive,
      })),
      interState,
      docDiscountType: dto.docDiscountType,
      docDiscountValue: dto.docDiscountValue,
      shippingCharge: dto.shippingCharge,
      packingCharge: dto.packingCharge,
      otherCharge: dto.otherCharge,
      roundOffEnabled: company.roundOffEnabled,
      paidAmount,
    });

    if (paidAmount > totals.grandTotal + 0.01) {
      throw new BadRequestException('Paid amount exceeds grand total');
    }

    const items = dto.items.map((i, idx) => {
      const line = totals.lines[idx];
      const costPrice = i.productId ? costMap.get(i.productId) ?? 0 : 0;
      return {
        productId: i.productId ? new Types.ObjectId(i.productId) : undefined,
        name: i.name,
        hsn: i.hsn,
        qty: i.qty,
        unitId: i.unitId ? new Types.ObjectId(i.unitId) : undefined,
        unitName: i.unitName,
        price: i.price,
        taxInclusive: i.taxInclusive ?? false,
        discountType: i.discountType ?? 'percent',
        discountValue: i.discountValue ?? 0,
        discount: line.discount,
        taxRate: i.taxRate ?? 0,
        cessRate: i.cessRate ?? 0,
        taxable: line.taxable,
        cgst: line.cgst,
        sgst: line.sgst,
        igst: line.igst,
        cess: line.cess,
        amount: line.total,
        costPrice,
      };
    });

    const profit = Math.round(
      items.reduce((s, i) => s + (i.taxable - i.qty * i.costPrice), 0) * 100,
    ) / 100;

    return {
      items,
      interState,
      docDiscountType: dto.docDiscountType ?? 'percent',
      docDiscountValue: dto.docDiscountValue ?? 0,
      docDiscount: totals.docDiscount,
      shippingCharge: dto.shippingCharge ?? 0,
      packingCharge: dto.packingCharge ?? 0,
      otherCharge: dto.otherCharge ?? 0,
      subtotal: totals.subtotal,
      cgst: totals.cgst,
      sgst: totals.sgst,
      igst: totals.igst,
      cess: totals.cess,
      taxTotal: totals.taxTotal,
      roundOff: totals.roundOff,
      grandTotal: totals.grandTotal,
      paidAmount: totals.paidAmount,
      balanceAmount: totals.balanceAmount,
      payments: dto.payments ?? [],
      profit,
      isLocked: totals.balanceAmount <= 0.009 && totals.grandTotal > 0 && !dto.isDraft,
    };
  }

  /** Apply stock + party balance effects for a finalized document */
  private async applyEffects(
    companyId: string,
    userId: string,
    doc: BusinessDocumentDocument,
    session: ClientSession,
    negativeStockAllowed: boolean,
  ) {
    const stockDir = STOCK_EFFECT[doc.docType];
    if (stockDir !== 0) {
      const changes: StockChange[] = doc.items
        .filter((i) => i.productId)
        .map((i) => ({
          productId: i.productId!,
          qty: i.qty * stockDir,
          rate: i.price,
          type: stockDir > 0 ? 'in' : 'out',
          refType: doc.docType,
          refId: doc._id as Types.ObjectId,
          refNumber: doc.number,
        }));
      await this.inventory.applyChanges(companyId, userId, changes, {
        session,
        allowNegative: negativeStockAllowed,
      });
    }

    const balDir = BALANCE_EFFECT[doc.docType];
    if (balDir !== 0 && doc.partyId) {
      // party owes/is owed the unpaid balance
      await this.parties.adjustBalance(companyId, doc.partyId, doc.balanceAmount * balDir, session);
    }
  }

  private async reverseEffects(
    companyId: string,
    userId: string,
    doc: BusinessDocumentDocument,
    session: ClientSession,
  ) {
    if (STOCK_EFFECT[doc.docType] !== 0) {
      await this.inventory.reverseForRef(companyId, userId, doc.docType, doc._id as Types.ObjectId, session);
    }
    const balDir = BALANCE_EFFECT[doc.docType];
    if (balDir !== 0 && doc.partyId) {
      await this.parties.adjustBalance(companyId, doc.partyId, -doc.balanceAmount * balDir, session);
    }
  }
}
