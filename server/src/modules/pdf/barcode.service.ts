import { Injectable } from '@nestjs/common';
import * as bwipjs from 'bwip-js';
import * as QRCode from 'qrcode';

@Injectable()
export class BarcodeService {
  /** Code128 barcode as PNG data URL */
  async barcodeDataUrl(text: string, opts: { scale?: number; height?: number } = {}): Promise<string> {
    const png = await bwipjs.toBuffer({
      bcid: 'code128',
      text,
      scale: opts.scale ?? 3,
      height: opts.height ?? 10,
      includetext: true,
      textxalign: 'center',
    });
    return `data:image/png;base64,${png.toString('base64')}`;
  }

  async qrDataUrl(text: string, opts: { width?: number } = {}): Promise<string> {
    return QRCode.toDataURL(text, { width: opts.width ?? 160, margin: 1 });
  }

  /** UPI payment QR (upi://pay intent) */
  async upiQrDataUrl(upiId: string, payeeName: string, amount?: number, note?: string): Promise<string> {
    const params = new URLSearchParams({ pa: upiId, pn: payeeName, cu: 'INR' });
    if (amount) params.set('am', amount.toFixed(2));
    if (note) params.set('tn', note);
    return this.qrDataUrl(`upi://pay?${params.toString()}`, { width: 180 });
  }

  /** Barcode label sheet (grid of labels) as HTML for printing */
  async labelSheetHtml(
    labels: { name: string; barcode: string; price?: number; mrp?: number }[],
    currencySymbol = '₹',
  ): Promise<string> {
    const cells = await Promise.all(
      labels.map(async (l) => {
        const img = await this.barcodeDataUrl(l.barcode, { scale: 2, height: 8 });
        return `<div class="label">
          <div class="name">${escapeHtml(l.name)}</div>
          <img src="${img}" alt="barcode" />
          ${l.mrp ? `<div class="price">MRP: ${currencySymbol}${l.mrp}</div>` : ''}
        </div>`;
      }),
    );
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      * { box-sizing: border-box; }
      body { font-family: Arial, sans-serif; margin: 0; padding: 8px; }
      .sheet { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
      .label { border: 1px dashed #ccc; padding: 6px; text-align: center; page-break-inside: avoid; }
      .label img { max-width: 100%; height: auto; }
      .name { font-size: 10px; font-weight: 600; margin-bottom: 2px; }
      .price { font-size: 10px; margin-top: 2px; }
    </style></head><body><div class="sheet">${cells.join('')}</div></body></html>`;
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  );
}
