import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Address, AddressSchema } from '../company/company.schema';

export type BusinessDocumentDocument = HydratedDocument<BusinessDocument>;

export type DocType =
  | 'invoice'
  | 'estimate'
  | 'challan'
  | 'sales-return'
  | 'purchase-bill'
  | 'purchase-order'
  | 'purchase-return'
  | 'proforma';

export const SALES_DOC_TYPES: DocType[] = ['invoice', 'estimate', 'challan', 'sales-return', 'proforma'];
export const PURCHASE_DOC_TYPES: DocType[] = ['purchase-bill', 'purchase-order', 'purchase-return'];

/** docTypes that move stock and party balance when finalized */
export const STOCK_EFFECT: Record<string, 1 | -1 | 0> = {
  invoice: -1, // stock out
  estimate: 0,
  proforma: 0,
  challan: -1,
  'sales-return': 1, // stock back in
  'purchase-bill': 1, // stock in
  'purchase-order': 0,
  'purchase-return': -1,
};

/** effect on party currentBalance (customer receivable / supplier payable) */
export const BALANCE_EFFECT: Record<string, 1 | -1 | 0> = {
  invoice: 1, // customer owes more
  estimate: 0,
  proforma: 0,
  challan: 0,
  'sales-return': -1,
  'purchase-bill': 1, // we owe supplier more
  'purchase-order': 0,
  'purchase-return': -1,
};

@Schema({ _id: false })
export class DocumentItem {
  @Prop({ type: Types.ObjectId }) productId?: Types.ObjectId;
  @Prop({ required: true }) name: string;
  @Prop() hsn?: string;
  @Prop({ required: true }) qty: number;
  @Prop({ type: Types.ObjectId }) unitId?: Types.ObjectId;
  @Prop() unitName?: string;
  @Prop({ required: true }) price: number;
  @Prop({ default: false }) taxInclusive: boolean;

  @Prop({ type: String, enum: ['percent', 'flat'], default: 'percent' })
  discountType: 'percent' | 'flat';
  @Prop({ default: 0 }) discountValue: number;
  @Prop({ default: 0 }) discount: number; // computed amount

  @Prop({ default: 0 }) taxRate: number;
  @Prop({ default: 0 }) cessRate: number;
  @Prop({ default: 0 }) taxable: number;
  @Prop({ default: 0 }) cgst: number;
  @Prop({ default: 0 }) sgst: number;
  @Prop({ default: 0 }) igst: number;
  @Prop({ default: 0 }) cess: number;
  @Prop({ default: 0 }) amount: number; // line total incl. tax

  /** purchase cost snapshot for profit calculation */
  @Prop({ default: 0 }) costPrice: number;
}
const DocumentItemSchema = SchemaFactory.createForClass(DocumentItem);

@Schema({ _id: false })
export class PaymentModeSplit {
  @Prop({ type: String, enum: ['cash', 'upi', 'bank', 'cheque', 'credit', 'card'] })
  mode: string;
  @Prop() amount: number;
  @Prop() reference?: string;
}
const PaymentModeSplitSchema = SchemaFactory.createForClass(PaymentModeSplit);

@Schema({ _id: false })
export class DocVersion {
  @Prop() at: Date;
  @Prop({ type: Types.ObjectId }) by: Types.ObjectId;
  @Prop() byName?: string;
  @Prop({ type: Object }) snapshot: Record<string, unknown>;
}
const DocVersionSchema = SchemaFactory.createForClass(DocVersion);

@Schema({ timestamps: true })
export class BusinessDocument {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: [
      'invoice',
      'estimate',
      'challan',
      'sales-return',
      'purchase-bill',
      'purchase-order',
      'purchase-return',
      'proforma',
    ],
    index: true,
  })
  docType: DocType;

  @Prop({ required: true })
  number: string;

  @Prop({ required: true, index: true })
  date: Date;

  @Prop() dueDate?: Date;

  // ---- Party ----
  @Prop({ type: Types.ObjectId, index: true }) partyId?: Types.ObjectId;
  @Prop() partyName?: string; // snapshot
  @Prop() partyPhone?: string;
  @Prop() partyEmail?: string;
  @Prop() partyGstin?: string;
  @Prop({ type: AddressSchema, default: {} }) billingAddress: Address;
  @Prop({ type: AddressSchema, default: {} }) shippingAddress: Address;

  @Prop() referenceNumber?: string;
  @Prop() salesPerson?: string;
  @Prop() paymentTerms?: string;

  // ---- Items & totals ----
  @Prop({ type: [DocumentItemSchema], default: [] })
  items: DocumentItem[];

  @Prop({ default: false }) interState: boolean;

  @Prop({ type: String, enum: ['percent', 'flat'], default: 'percent' })
  docDiscountType: 'percent' | 'flat';
  @Prop({ default: 0 }) docDiscountValue: number;
  @Prop({ default: 0 }) docDiscount: number;

  @Prop({ default: 0 }) shippingCharge: number;
  @Prop({ default: 0 }) packingCharge: number;
  @Prop({ default: 0 }) otherCharge: number;

  @Prop({ default: 0 }) subtotal: number;
  @Prop({ default: 0 }) cgst: number;
  @Prop({ default: 0 }) sgst: number;
  @Prop({ default: 0 }) igst: number;
  @Prop({ default: 0 }) cess: number;
  @Prop({ default: 0 }) taxTotal: number;
  @Prop({ default: 0 }) roundOff: number;
  @Prop({ default: 0 }) grandTotal: number;

  @Prop({ default: 0 }) paidAmount: number;
  @Prop({ default: 0 }) balanceAmount: number;

  /** profit snapshot: Σ (line taxable - qty*costPrice) */
  @Prop({ default: 0 }) profit: number;

  // ---- Status ----
  @Prop({ default: 'draft', index: true })
  status: string;
  // invoice: draft | unpaid | partial | paid | cancelled
  // estimate: pending | accepted | rejected | expired | converted
  // challan: pending | delivered | converted
  // purchase-order: pending | converted | cancelled
  // returns/bills: draft | unpaid | partial | paid | cancelled

  @Prop({ type: [PaymentModeSplitSchema], default: [] })
  payments: PaymentModeSplit[];

  @Prop() notes?: string;
  @Prop() terms?: string;

  // ---- Conversions & relations ----
  @Prop({ type: Types.ObjectId }) convertedFrom?: Types.ObjectId;
  @Prop() convertedFromType?: string;
  @Prop({ type: Types.ObjectId }) convertedTo?: Types.ObjectId;
  @Prop() convertedToType?: string;
  /** for returns: the original invoice/bill */
  @Prop({ type: Types.ObjectId }) againstDocId?: Types.ObjectId;
  @Prop() againstDocNumber?: string;

  /** docType-specific data: vehicle/driver/otp (challan), validUntil (estimate), returnReason... */
  @Prop({ type: Object, default: {} })
  extra: Record<string, unknown>;

  /** e-invoice / e-way readiness */
  @Prop({ type: Object, default: {} })
  compliance: Record<string, unknown>;

  @Prop({ default: false }) isLocked: boolean;

  @Prop({ type: [DocVersionSchema], default: [] })
  versionHistory: DocVersion[];

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Date, default: null, index: true })
  deletedAt?: Date | null;
}

export const BusinessDocumentSchema = SchemaFactory.createForClass(BusinessDocument);
BusinessDocumentSchema.index({ companyId: 1, docType: 1, number: 1 }, { unique: true });
BusinessDocumentSchema.index({ companyId: 1, docType: 1, date: -1 });
BusinessDocumentSchema.index({ companyId: 1, docType: 1, status: 1 });
BusinessDocumentSchema.index({ companyId: 1, partyId: 1, date: -1 });
BusinessDocumentSchema.index({ companyId: 1, partyName: 'text', number: 'text' });
