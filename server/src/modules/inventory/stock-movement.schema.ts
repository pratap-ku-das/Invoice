import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StockMovementDocument = HydratedDocument<StockMovement>;

export type StockMovementType =
  | 'in'
  | 'out'
  | 'adjust'
  | 'damage'
  | 'transfer'
  | 'opening';

/**
 * Append-only stock ledger. Current stock is denormalized on Product
 * and always changed together with an entry here (same transaction).
 */
@Schema({ timestamps: true })
export class StockMovement {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  productId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['in', 'out', 'adjust', 'damage', 'transfer', 'opening'],
    required: true,
  })
  type: StockMovementType;

  /** signed quantity: positive adds stock, negative removes */
  @Prop({ required: true })
  qty: number;

  /** unit cost/price at time of movement (for valuation) */
  @Prop({ default: 0 })
  rate: number;

  /** what caused it: invoice | purchase-bill | sales-return | manual ... */
  @Prop() refType?: string;
  @Prop({ type: Types.ObjectId }) refId?: Types.ObjectId;
  @Prop() refNumber?: string;

  @Prop() warehouse?: string;
  @Prop() toWarehouse?: string; // for transfers
  @Prop() note?: string;

  /** stock level after this movement (audit convenience) */
  @Prop({ default: 0 })
  balanceAfter: number;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;
}

export const StockMovementSchema = SchemaFactory.createForClass(StockMovement);
StockMovementSchema.index({ companyId: 1, productId: 1, createdAt: -1 });
StockMovementSchema.index({ companyId: 1, refType: 1, refId: 1 });
