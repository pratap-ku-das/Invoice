import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Address, AddressSchema } from './company.schema';

export type BranchDocument = HydratedDocument<Branch>;

@Schema({ timestamps: true })
export class Branch {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  branchName: string;

  @Prop({ required: true, trim: true })
  branchCode: string;

  @Prop({ type: AddressSchema, default: {} })
  address: Address;

  @Prop()
  phone?: string;

  @Prop({ default: false })
  isMain: boolean;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);
BranchSchema.index({ companyId: 1, branchCode: 1 }, { unique: true });
