import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { DEFAULT_PLAN, PLANS, type PlanId, type PlanLimits } from '../../common/constants/plans';

export type CompanyDocument = HydratedDocument<Company>;

@Schema({ _id: false })
export class BankDetails {
  @Prop() accountName?: string;
  @Prop() accountNumber?: string;
  @Prop() bankName?: string;
  @Prop() ifsc?: string;
  @Prop() branch?: string;
}

@Schema({ _id: false })
export class Address {
  @Prop() line1?: string;
  @Prop() line2?: string;
  @Prop() city?: string;
  @Prop() state?: string;
  @Prop() stateCode?: string;
  @Prop() pincode?: string;
  @Prop({ default: 'India' }) country?: string;
}
export const AddressSchema = SchemaFactory.createForClass(Address);

@Schema({ _id: false })
export class PrintSettings {
  @Prop({ default: 'modern' }) theme: string;
  @Prop({ default: 'A4' }) paperSize: string; // A4 | thermal-58 | thermal-80
  @Prop({ default: 'portrait' }) orientation: string;
  @Prop({ default: 10 }) marginMm: number;
  @Prop({ default: false }) autoPrint: boolean;
  @Prop({ default: true }) showLogo: boolean;
  @Prop({ default: true }) showSignature: boolean;
  @Prop({ default: true }) showBankDetails: boolean;
  @Prop({ default: true }) showUpiQr: boolean;
}

@Schema({ _id: false })
export class Subscription {
  @Prop({ type: String, enum: ['free', 'basic', 'pro'], default: DEFAULT_PLAN })
  plan: PlanId;

  @Prop({ type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' })
  status: string;

  /** undefined = never expires (free plan) */
  @Prop() expiresAt?: Date;

  /** snapshot of plan limits — allows per-company overrides */
  @Prop({ type: Object, default: () => ({ ...PLANS[DEFAULT_PLAN].limits }) })
  limits: PlanLimits;
}

@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  displayName?: string;

  @Prop()
  description?: string;

  @Prop()
  businessType?: string; // Proprietorship, Partnership, LLP, Private Limited, Public Limited, OPC, Trust, NGO, Individual

  @Prop()
  industry?: string; // Retail, Wholesale, Manufacturing, Grocery, Pharmacy, Restaurant, Electronics, Automobile, Textile, Jewellery, Construction, Education, Healthcare, Service, Others

  /** user who created this company; drives the per-owner company limit */
  @Prop({ type: Types.ObjectId, index: true })
  ownerId?: Types.ObjectId;

  @Prop({ type: Subscription, default: () => ({}) })
  subscription: Subscription;

  @Prop() logo?: string;
  @Prop({ default: false }) hasGst: boolean;
  @Prop() gstin?: string;
  @Prop() pan?: string;
  @Prop() tan?: string;
  @Prop() cin?: string;

  @Prop() phone?: string;
  @Prop() alternateMobile?: string;
  @Prop() whatsappNumber?: string;
  @Prop() email?: string;
  @Prop() website?: string;

  @Prop({ type: Address, default: {} })
  address: Address;

  @Prop() district?: string;

  @Prop({ type: BankDetails, default: {} })
  bank: BankDetails;

  @Prop() upiId?: string;
  @Prop() signature?: string;
  @Prop() seal?: string;
  @Prop() brandColor?: string;

  @Prop({ default: 'INR' }) currency: string;
  @Prop({ default: '₹' }) currencySymbol: string;
  @Prop({ default: 4 }) financialYearStartMonth: number; // April
  @Prop({ default: 'Asia/Kolkata' }) timezone: string;
  @Prop({ default: 'English' }) language: string;

  @Prop({ default: true }) roundOffEnabled: boolean;
  @Prop({ default: false }) negativeStockAllowed: boolean;
  @Prop({ default: 0 }) defaultTaxRate: number;

  @Prop({ type: PrintSettings, default: {} })
  printSettings: PrintSettings;

  @Prop() termsAndConditions?: string;
  @Prop() invoiceNotes?: string;

  @Prop({ default: false }) isOnboardingCompleted: boolean;
  @Prop({ default: 1 }) onboardingStep: number;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
