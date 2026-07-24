/**
 * GST tax calculation engine.
 * Pure functions — mirrored on the client for live invoice preview.
 *
 * Flow per line: qty × price → line discount → taxable value →
 * CGST+SGST (intra-state) or IGST (inter-state) → cess → line amount.
 * Document: Σ lines → document discount → charges → round off → grand total.
 */

export type DiscountType = 'percent' | 'flat';

export interface LineInput {
  qty: number;
  price: number;
  discountType?: DiscountType;
  discountValue?: number;
  taxRate?: number; // GST % e.g. 18
  cessRate?: number; // %
  /** price includes tax (inclusive pricing) */
  taxInclusive?: boolean;
}

export interface LineTax {
  gross: number; // qty*price (tax-exclusive basis)
  discount: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  taxAmount: number;
  total: number; // taxable + taxes
}

export interface DocTotalsInput {
  lines: LineInput[];
  interState: boolean;
  docDiscountType?: DiscountType;
  docDiscountValue?: number;
  shippingCharge?: number;
  packingCharge?: number;
  otherCharge?: number;
  /** enable rounding grand total to nearest rupee */
  roundOffEnabled?: boolean;
  paidAmount?: number;
}

export interface DocTotals {
  lines: LineTax[];
  subtotal: number; // Σ taxable before doc discount
  lineDiscountTotal: number;
  docDiscount: number;
  taxableTotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  taxTotal: number;
  charges: number;
  roundOff: number;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
}

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function calcLine(input: LineInput, interState: boolean): LineTax {
  const qty = input.qty || 0;
  const taxRate = input.taxRate || 0;
  const cessRate = input.cessRate || 0;
  let unitPrice = input.price || 0;

  // If price is tax-inclusive, back out the base price
  if (input.taxInclusive && taxRate + cessRate > 0) {
    unitPrice = unitPrice / (1 + (taxRate + cessRate) / 100);
  }

  const gross = r2(qty * unitPrice);

  let discount = 0;
  if (input.discountValue && input.discountValue > 0) {
    discount =
      input.discountType === 'flat'
        ? Math.min(input.discountValue, gross)
        : r2((gross * input.discountValue) / 100);
  }

  const taxable = r2(gross - discount);
  const taxAmount = r2((taxable * taxRate) / 100);
  const cess = r2((taxable * cessRate) / 100);

  const cgst = interState ? 0 : r2(taxAmount / 2);
  const sgst = interState ? 0 : r2(taxAmount - cgst);
  const igst = interState ? r2(taxAmount) : 0;

  return {
    gross,
    discount: r2(discount),
    taxable,
    cgst,
    sgst,
    igst,
    cess,
    taxAmount: r2(cgst + sgst + igst),
    total: r2(taxable + cgst + sgst + igst + cess),
  };
}

export function calcDocument(input: DocTotalsInput): DocTotals {
  const lines = input.lines.map((l) => calcLine(l, input.interState));

  const subtotal = r2(lines.reduce((s, l) => s + l.taxable, 0));
  const lineDiscountTotal = r2(lines.reduce((s, l) => s + l.discount, 0));
  const cgst = r2(lines.reduce((s, l) => s + l.cgst, 0));
  const sgst = r2(lines.reduce((s, l) => s + l.sgst, 0));
  const igst = r2(lines.reduce((s, l) => s + l.igst, 0));
  const cess = r2(lines.reduce((s, l) => s + l.cess, 0));
  const taxTotal = r2(cgst + sgst + igst);

  let docDiscount = 0;
  if (input.docDiscountValue && input.docDiscountValue > 0) {
    docDiscount =
      input.docDiscountType === 'flat'
        ? Math.min(input.docDiscountValue, subtotal)
        : r2((subtotal * input.docDiscountValue) / 100);
  }

  const charges = r2(
    (input.shippingCharge || 0) + (input.packingCharge || 0) + (input.otherCharge || 0),
  );

  const beforeRound = r2(subtotal - docDiscount + taxTotal + cess + charges);
  const roundOff = input.roundOffEnabled === false ? 0 : r2(Math.round(beforeRound) - beforeRound);
  const grandTotal = r2(beforeRound + roundOff);

  const paidAmount = r2(input.paidAmount || 0);
  const balanceAmount = r2(Math.max(0, grandTotal - paidAmount));

  return {
    lines,
    subtotal,
    lineDiscountTotal,
    docDiscount: r2(docDiscount),
    taxableTotal: r2(subtotal - docDiscount),
    cgst,
    sgst,
    igst,
    cess,
    taxTotal,
    charges,
    roundOff,
    grandTotal,
    paidAmount,
    balanceAmount,
  };
}

/** Indian state code from GSTIN (first 2 chars) — used to decide intra vs inter state */
export function stateCodeFromGstin(gstin?: string | null): string | null {
  if (!gstin || gstin.length < 2) return null;
  const code = gstin.slice(0, 2);
  return /^\d{2}$/.test(code) ? code : null;
}

export function isInterState(companyGstin?: string | null, partyGstin?: string | null): boolean {
  const a = stateCodeFromGstin(companyGstin);
  const b = stateCodeFromGstin(partyGstin);
  if (!a || !b) return false; // default intra-state when unknown
  return a !== b;
}
