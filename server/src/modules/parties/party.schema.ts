import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Address, AddressSchema } from '../company/company.schema';

export type PartyDocument = HydratedDocument<Party>;

/**
 * Unified party schema — customers and suppliers, discriminated by `partyType`.
 * `currentBalance` > 0 means the party owes us (receivable) for customers,
 * or we owe them (payable) for suppliers.
 */
@Schema({ timestamps: true })
export class Party {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ type: String, enum: ['customer', 'supplier'], required: true, index: true })
  partyType: 'customer' | 'supplier';

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true }) phone?: string;
  @Prop({ trim: true, lowercase: true }) email?: string;
  @Prop({ trim: true }) whatsapp?: string;
  @Prop({ trim: true, uppercase: true }) gstin?: string;
  @Prop({ trim: true, uppercase: true }) pan?: string;

  @Prop({ type: AddressSchema, default: {} })
  billingAddress: Address;

  @Prop({ type: AddressSchema, default: {} })
  shippingAddress: Address;

  @Prop({ default: 0 })
  creditLimit: number;

  @Prop({ default: 0 })
  creditDays: number;

  @Prop({ default: 0 })
  openingBalance: number;

  /** Live balance: openingBalance + invoices - payments (maintained transactionally) */
  @Prop({ default: 0 })
  currentBalance: number;

  @Prop() notes?: string;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Date, default: null, index: true })
  deletedAt?: Date | null;
}

export const PartySchema = SchemaFactory.createForClass(Party);
PartySchema.index({ companyId: 1, partyType: 1, name: 1 });
PartySchema.index({ companyId: 1, partyType: 1, phone: 1 });
