export type Role = 'super_admin' | 'platform_owner' | 'admin' | 'manager' | 'sales' | 'accountant' | 'cashier' | 'viewer';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyId: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface CompanySummary {
  companyId: string;
  name: string;
  role: Role;
  isDefault: boolean;
  plan: string;
}

export interface PlanLimits {
  maxInvoicesPerMonth: number;
  maxUsers: number;
  maxCompanies: number;
}

export interface PlanInfo {
  plan: string;
  planName: string;
  status: 'active' | 'expired' | 'cancelled';
  expiresAt?: string;
  limits: PlanLimits;
  usage: { invoicesThisMonth: number; users: number; companiesOwned: number };
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  /** document lists also return aggregate totals */
  summary?: Record<string, number>;
}

export interface ListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

/** Matches server DocType exactly */
export type DocumentType =
  | 'invoice'
  | 'estimate'
  | 'challan'
  | 'sales-return'
  | 'purchase-bill'
  | 'purchase-order'
  | 'purchase-return'
  | 'proforma';

export type DocStatus =
  | 'draft'
  | 'unpaid'
  | 'partial'
  | 'paid'
  | 'cancelled'
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'converted'
  | 'delivered';

export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  pincode?: string;
  country?: string;
}

export interface DocItem {
  productId?: string;
  name: string;
  hsn?: string;
  qty: number;
  unitId?: string;
  unitName?: string;
  price: number;
  taxInclusive?: boolean;
  discountType?: 'percent' | 'flat';
  discountValue?: number;
  discount?: number;
  taxRate?: number;
  cessRate?: number;
  taxable?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  cess?: number;
  amount?: number;
}

export interface BusinessDoc {
  _id: string;
  docType: DocumentType;
  number: string;
  date: string;
  dueDate?: string;
  partyId?: string;
  partyName?: string;
  partyPhone?: string;
  partyEmail?: string;
  partyGstin?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  referenceNumber?: string;
  salesPerson?: string;
  paymentTerms?: string;
  items: DocItem[];
  interState?: boolean;
  docDiscountType?: 'percent' | 'flat';
  docDiscountValue?: number;
  docDiscount?: number;
  shippingCharge?: number;
  packingCharge?: number;
  otherCharge?: number;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  taxTotal: number;
  roundOff: number;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  profit?: number;
  status: DocStatus;
  payments?: { mode: string; amount: number; reference?: string }[];
  notes?: string;
  terms?: string;
  convertedFrom?: string;
  convertedTo?: string;
  extra?: Record<string, unknown>;
  isLocked?: boolean;
  createdAt?: string;
}

export interface Party {
  _id: string;
  partyType: 'customer' | 'supplier';
  name: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  gstin?: string;
  pan?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  creditLimit?: number;
  creditDays?: number;
  openingBalance?: number;
  currentBalance?: number;
  notes?: string;
}

export interface Product {
  _id: string;
  name: string;
  sku?: string;
  barcode?: string;
  hsn?: string;
  itemType: 'product' | 'service';
  categoryId?: string;
  brand?: string;
  unitId?: string;
  purchasePrice?: number;
  sellingPrice: number;
  mrp?: number;
  taxInclusive?: boolean;
  gstRate: number;
  cessRate?: number;
  stock?: { current: number; minimum: number; opening: number };
  warehouse?: string;
  images?: string[];
  description?: string;
  isActive?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  parentId?: string | null;
  description?: string;
}

export interface Unit {
  _id: string;
  name: string;
  shortName: string;
  conversions?: { unitId: string; factor: number }[];
}

export interface PaymentRecord {
  _id: string;
  number: string;
  type: 'in' | 'out';
  partyId: string;
  partyName?: string;
  amount: number;
  mode: string;
  date: string;
  allocations?: { documentId: string; documentNumber?: string; docType?: string; amount: number }[];
  advanceAmount?: number;
  reference?: string;
  note?: string;
}

export interface ExpenseRecord {
  _id: string;
  number: string;
  categoryId?: string;
  categoryName?: string;
  amount: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  date: string;
  paymentMode: string;
  reference?: string;
  note?: string;
  isRecurring?: boolean;
  recurringFrequency?: string | null;
}

export interface CompanyProfile {
  _id: string;
  name: string;
  logo?: string;
  gstin?: string;
  pan?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: Address;
  bank?: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    ifsc?: string;
    branch?: string;
  };
  upiId?: string;
  signature?: string;
  brandColor?: string;
  currency?: string;
  currencySymbol?: string;
  financialYearStartMonth?: number;
  roundOffEnabled?: boolean;
  negativeStockAllowed?: boolean;
  defaultTaxRate?: number;
  printSettings?: {
    theme?: string;
    paperSize?: string;
    orientation?: string;
    marginMm?: number;
    autoPrint?: boolean;
    showLogo?: boolean;
    showSignature?: boolean;
    showBankDetails?: boolean;
    showUpiQr?: boolean;
  };
  termsAndConditions?: string;
  invoiceNotes?: string;
}
