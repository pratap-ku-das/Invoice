import { api } from '@/lib/api';

export interface HsnSuggestionResponse {
  hsnCode: string;
  gstRate: number;
  category: string;
  description: string;
  source: 'gemini' | 'fallback';
}

export interface ParsedItem {
  name: string;
  hsnCode?: string;
  qty: number;
  rate: number;
  taxRate: number;
}

export interface ReceiptScanResponse {
  vendorName?: string;
  vendorGstin?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  items: ParsedItem[];
  subtotal?: number;
  totalTax?: number;
  totalAmount?: number;
}

export const aiService = {
  async suggestHsn(title: string): Promise<HsnSuggestionResponse> {
    const res = await api.post('/ai/suggest-hsn', { title });
    return res.data;
  },

  async scanReceipt(base64Data: string, mimeType: string): Promise<ReceiptScanResponse> {
    const res = await api.post('/ai/scan-receipt', { base64Data, mimeType });
    return res.data;
  },

  async parseVoice(transcript: string): Promise<{ customerName?: string; items: ParsedItem[] }> {
    const res = await api.post('/ai/parse-voice', { transcript });
    return res.data;
  },

  async askCopilot(query: string): Promise<{ answer: string }> {
    const res = await api.post('/ai/copilot', { query });
    return res.data;
  },
};
