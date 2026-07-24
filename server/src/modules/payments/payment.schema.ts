import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ _id: false })
export class PaymentAllocation {
  @Prop({ type: Types.ObjectId, required: true }) documentId: Types.ObjectId;
  @Prop() documentNumber?: string;
  @Prop() docType?: string;
  @Prop({ required: true }) amount: number;
}
const PaymentAllocationSchema = SchemaFactory.createForClass(PaymentAllocation);

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ required: true })
  number: string;

  /** in = money received (from customer), out = money paid (to supplier) */
  @Prop({ type: String, enum: ['in', 'out'], required: true, index: true })
  type: 'in' | 'out';

  @Prop({ type: Types.ObjectId, required: true, index: true })
  partyId: Types.ObjectId;

  @Prop() partyName?: string;

  @Prop({ required: true })
  amount: number;

  @Prop({
    type: String,
    enum: ['cash', 'upi', 'bank', 'cheque', 'credit', 'card'],
    default: 'cash',
  })
  mode: string;

  @Prop({ required: true, index: true })
  date: Date;

  @Prop({ type: [PaymentAllocationSchema], default: [] })
  allocations: PaymentAllocation[];

  /** amount not allocated to any document = advance */
  @Prop({ default: 0 })
  advanceAmount: number;

  @Prop() reference?: string;
  @Prop() note?: string;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Date, default: null, index: true })
  deletedAt?: Date | null;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.index({ companyId: 1, type: 1, date: -1 });
PaymentSchema.index({ companyId: 1, partyId: 1, date: -1 });
