import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NumberSequenceDocument = HydratedDocument<NumberSequence>;

/**
 * Atomic per-company, per-docType number counter.
 * findOneAndUpdate with $inc guarantees no duplicates under concurrency.
 */
@Schema({ timestamps: true })
export class NumberSequence {
  @Prop({ type: Types.ObjectId, required: true })
  companyId: Types.ObjectId;

  @Prop({ required: true })
  docType: string;

  @Prop({ required: true })
  prefix: string;

  /** Last used number; 0 = nothing issued yet */
  @Prop({ default: 0 })
  counter: number;

  @Prop({ default: 0 })
  padding: number; // e.g. 4 → INV-0001
}

export const NumberSequenceSchema = SchemaFactory.createForClass(NumberSequence);
NumberSequenceSchema.index({ companyId: 1, docType: 1 }, { unique: true });
