import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ExpenseCategoryDocument = HydratedDocument<ExpenseCategory>;

@Schema({ timestamps: true })
export class ExpenseCategory {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop() description?: string;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Date, default: null, index: true })
  deletedAt?: Date | null;
}
export const ExpenseCategorySchema = SchemaFactory.createForClass(ExpenseCategory);

export type ExpenseDocument = HydratedDocument<Expense>;

@Schema({ timestamps: true })
export class Expense {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ required: true })
  number: string;

  @Prop({ type: Types.ObjectId, index: true })
  categoryId?: Types.ObjectId;

  @Prop() categoryName?: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 0 }) taxRate: number;
  @Prop({ default: 0 }) taxAmount: number;
  @Prop({ default: 0 }) total: number;

  @Prop({ required: true, index: true })
  date: Date;

  @Prop({ type: String, enum: ['cash', 'upi', 'bank', 'cheque', 'card'], default: 'cash' })
  paymentMode: string;

  @Prop({ type: Types.ObjectId }) partyId?: Types.ObjectId; // optional supplier/vendor
  @Prop() partyName?: string;

  @Prop() reference?: string;
  @Prop() note?: string;
  @Prop({ type: [String], default: [] }) attachments: string[];

  // recurring
  @Prop({ default: false }) isRecurring: boolean;
  @Prop({ type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], default: null })
  recurringFrequency?: string | null;
  @Prop() nextRunDate?: Date;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Date, default: null, index: true })
  deletedAt?: Date | null;
}
export const ExpenseSchema = SchemaFactory.createForClass(Expense);
ExpenseSchema.index({ companyId: 1, date: -1 });
ExpenseSchema.index({ companyId: 1, categoryId: 1 });
