/**
 * Client-side mirror of the server tax engine (server/src/common/utils/tax-engine.ts).
 * Keep the two in sync — server output is authoritative on save.
 */

export type DiscountType = 'percent' | 'flat';

export interface LineInput {
  qty: number;
  price: number;
  discountType?: DiscountType;
  discountValue?: number;
  taxRate?: number;
  cessRate?: number;
  taxInclusive?: boolean;
}

export interface LineTax {
  gross: number;
  discount: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  taxAmount: number;
  total: number;
}

export interface DocTotalsInput {
  lines: LineInput[];
  interState: boolean;
  docDiscountType?: DiscountType;
  docDiscountValue?: number;
  shippingCharge?: number;
  packingCharge?: number;
  otherCharge?: number;
  roundOffEnabled?: boolean;
  paidAmount?: number;
}

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function calcLine(input: LineInput, interState: boolean): LineTax {
  const qty = input.qty || 0;
  const taxRate = input.taxRate || 0;
  const cessRate = input.cessRate || 0;
  let unitPrice = input.price || 0;

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

export function calcDocument(input: DocTotalsInput) {
  const lines = input.lines.map((l) => calcLine(l, input.interState));

  const subtotal = r2(lines.reduce((s, l) => s + l.taxable, 0));
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
    docDiscount: r2(docDiscount),
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

export function stateCodeFromGstin(gstin?: string | null): string | null {
  if (!gstin || gstin.length < 2) return null;
  const code = gstin.slice(0, 2);
  return /^\d{2}$/.test(code) ? code : null;
}

export function isInterState(companyGstin?: string | null, partyGstin?: string | null): boolean {
  const a = stateCodeFromGstin(companyGstin);
  const b = stateCodeFromGstin(partyGstin);
  if (!a || !b) return false;
  return a !== b;
}
