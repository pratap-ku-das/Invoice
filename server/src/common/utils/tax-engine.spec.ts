import { calcDocument, calcLine, isInterState, stateCodeFromGstin } from './tax-engine';

describe('tax engine', () => {
  describe('calcLine', () => {
    it('computes a simple 18% GST line (intra-state → CGST+SGST)', () => {
      const line = calcLine({ qty: 2, price: 100, taxRate: 18 }, false);
      expect(line.gross).toBe(200);
      expect(line.taxable).toBe(200);
      expect(line.cgst).toBe(18);
      expect(line.sgst).toBe(18);
      expect(line.igst).toBe(0);
      expect(line.total).toBe(236);
    });

    it('uses IGST for inter-state', () => {
      const line = calcLine({ qty: 1, price: 1000, taxRate: 12 }, true);
      expect(line.igst).toBe(120);
      expect(line.cgst).toBe(0);
      expect(line.sgst).toBe(0);
      expect(line.taxAmount).toBe(120);
    });

    it('applies percent line discount before tax', () => {
      const line = calcLine(
        { qty: 1, price: 200, discountType: 'percent', discountValue: 10, taxRate: 18 },
        false,
      );
      expect(line.discount).toBe(20);
      expect(line.taxable).toBe(180);
      expect(line.taxAmount).toBeCloseTo(32.4, 2);
    });

    it('backs out base price for tax-inclusive pricing', () => {
      const line = calcLine({ qty: 1, price: 118, taxRate: 18, taxInclusive: true }, false);
      expect(line.taxable).toBeCloseTo(100, 1);
      expect(line.total).toBeCloseTo(118, 1);
    });

    it('clamps flat discount at gross', () => {
      const line = calcLine({ qty: 1, price: 50, discountType: 'flat', discountValue: 100 }, false);
      expect(line.taxable).toBe(0);
    });

    it('handles zero/missing inputs safely', () => {
      const line = calcLine({ qty: 0, price: 0 }, false);
      expect(line.gross).toBe(0);
      expect(line.total).toBe(0);
    });

    it('applies cess on taxable value', () => {
      const line = calcLine({ qty: 1, price: 100, taxRate: 28, cessRate: 12 }, false);
      expect(line.cess).toBe(12);
      expect(line.total).toBe(140); // 100 + 28 GST + 12 cess
    });
  });

  describe('calcDocument', () => {
    it('rounds off the grand total to nearest rupee', () => {
      const doc = calcDocument({
        lines: [{ qty: 3, price: 33.33, taxRate: 5 }],
        interState: false,
        roundOffEnabled: true,
      });
      expect(Number.isInteger(doc.grandTotal)).toBe(true);
      expect(Math.abs(doc.roundOff)).toBeLessThanOrEqual(0.5);
    });

    it('computes document totals with charges and flat doc discount', () => {
      const doc = calcDocument({
        lines: [
          { qty: 1, price: 500, taxRate: 18 },
          { qty: 2, price: 250, taxRate: 12 },
        ],
        interState: false,
        docDiscountType: 'flat',
        docDiscountValue: 100,
        shippingCharge: 50,
        roundOffEnabled: false,
        paidAmount: 200,
      });
      expect(doc.subtotal).toBe(1000);
      expect(doc.docDiscount).toBe(100);
      expect(doc.taxTotal).toBeCloseTo(150, 2);
      expect(doc.grandTotal).toBeCloseTo(1100, 2);
      expect(doc.balanceAmount).toBeCloseTo(doc.grandTotal - 200, 2);
    });

    it('never returns a negative balance when overpaid', () => {
      const doc = calcDocument({
        lines: [{ qty: 1, price: 100 }],
        interState: false,
        roundOffEnabled: false,
        paidAmount: 500,
      });
      expect(doc.balanceAmount).toBe(0);
    });
  });

  describe('GSTIN state detection', () => {
    it('extracts the 2-digit state code', () => {
      expect(stateCodeFromGstin('27AAAAA0000A1Z5')).toBe('27');
      expect(stateCodeFromGstin('XYAAAAA0000A1Z5')).toBeNull();
      expect(stateCodeFromGstin('')).toBeNull();
      expect(stateCodeFromGstin(undefined)).toBeNull();
    });

    it('detects inter-state from GSTIN state codes', () => {
      expect(isInterState('27AAAAA0000A1Z5', '27BBBBB0000B1Z5')).toBe(false); // both MH
      expect(isInterState('27AAAAA0000A1Z5', '29BBBBB0000B1Z5')).toBe(true); // MH vs KA
      expect(isInterState('27AAAAA0000A1Z5', undefined)).toBe(false); // unknown → intra
    });
  });
});
