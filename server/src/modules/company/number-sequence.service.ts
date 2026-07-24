import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { NumberSequence, NumberSequenceDocument } from './number-sequence.schema';

export const DEFAULT_PREFIXES: Record<string, string> = {
  invoice: 'INV',
  estimate: 'EST',
  challan: 'DC',
  'sales-return': 'CN',
  'purchase-bill': 'PB',
  'purchase-order': 'PO',
  'purchase-return': 'DN',
  payment: 'PAY',
  expense: 'EXP',
  proforma: 'PI',
};

/**
 * `counter` stores the LAST USED number (0 = none used yet).
 * $inc atomically reserves the next one — no duplicates under concurrency.
 */
@Injectable()
export class NumberSequenceService {
  constructor(
    @InjectModel(NumberSequence.name)
    private readonly seqModel: Model<NumberSequenceDocument>,
  ) {}

  private format(prefix: string, n: number, padding: number): string {
    const padded = padding > 0 ? String(n).padStart(padding, '0') : String(n);
    return `${prefix}-${padded}`;
  }

  /** Atomically reserve the next document number, e.g. INV-42 */
  async nextNumber(companyId: string, docType: string, session?: ClientSession): Promise<string> {
    const seq = await this.seqModel.findOneAndUpdate(
      { companyId: new Types.ObjectId(companyId), docType },
      {
        $inc: { counter: 1 },
        $setOnInsert: { prefix: DEFAULT_PREFIXES[docType] ?? docType.toUpperCase() },
      },
      { new: true, upsert: true, session },
    );
    return this.format(seq.prefix, seq.counter, seq.padding);
  }

  /** Peek at what the next number will be, without reserving it */
  async peekNumber(companyId: string, docType: string): Promise<string> {
    const seq = await this.seqModel.findOne({
      companyId: new Types.ObjectId(companyId),
      docType,
    });
    const prefix = seq?.prefix ?? DEFAULT_PREFIXES[docType] ?? docType.toUpperCase();
    return this.format(prefix, (seq?.counter ?? 0) + 1, seq?.padding ?? 0);
  }

  /** nextNumber: the next number to issue (counter = nextNumber - 1) */
  async updateSettings(
    companyId: string,
    docType: string,
    settings: { prefix?: string; nextNumber?: number; padding?: number },
  ) {
    const $set: Record<string, unknown> = {};
    if (settings.prefix !== undefined) $set.prefix = settings.prefix;
    if (settings.padding !== undefined) $set.padding = settings.padding;
    if (settings.nextNumber !== undefined) $set.counter = Math.max(0, settings.nextNumber - 1);
    return this.seqModel.findOneAndUpdate(
      { companyId: new Types.ObjectId(companyId), docType },
      { $set },
      { new: true, upsert: true },
    );
  }

  async listSettings(companyId: string) {
    return this.seqModel.find({ companyId: new Types.ObjectId(companyId) }).lean();
  }
}
