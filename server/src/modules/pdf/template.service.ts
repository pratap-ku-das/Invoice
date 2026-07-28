import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import dayjs from 'dayjs';
import { numberToWords } from './number-to-words';

export const THEMES = [
  'modern',
  'professional',
  'gst',
  'minimal',
  'corporate',
  'blue',
  'dark',
  'classic',
] as const;
export type Theme = (typeof THEMES)[number];

export interface InvoiceTemplateData {
  company: Record<string, unknown>;
  doc: Record<string, unknown>;
  title: string;
  upiQr?: string;
  barcode?: string;
  meta: { theme: Theme; paperSize: string; thermal: boolean };
}

@Injectable()
export class TemplateService implements OnModuleInit {
  private compiled = new Map<string, HandlebarsTemplateDelegate>();
  private base = '';

  onModuleInit() {
    this.registerHelpers();
  }

  private templateDir() {
    // Check src/ first in dev, then __dirname/dist
    const candidates = [
      join(process.cwd(), 'src', 'modules', 'pdf', 'templates'),
      join(__dirname, 'templates'),
      join(process.cwd(), 'dist', 'modules', 'pdf', 'templates'),
    ];
    return candidates.find((c) => existsSync(join(c, 'base.hbs'))) ?? candidates[0];
  }

  private registerHelpers() {
    Handlebars.registerHelper('money', (v: unknown, symbol?: unknown) => {
      const n = Number(v) || 0;
      const sym = typeof symbol === 'string' ? symbol : '';
      return `${sym}${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    });
    Handlebars.registerHelper('date', (v: unknown) => (v ? dayjs(v as string).format('DD MMM YYYY') : ''));
    Handlebars.registerHelper('words', (v: unknown) => numberToWords(Number(v) || 0));
    Handlebars.registerHelper('inc', (v: unknown) => Number(v) + 1);
    Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
    Handlebars.registerHelper('gt', (a: unknown, b: unknown) => Number(a) > Number(b));
    Handlebars.registerHelper('or', (...args: unknown[]) => args.slice(0, -1).some(Boolean));
    Handlebars.registerHelper('and', (...args: unknown[]) => args.slice(0, -1).every(Boolean));
    Handlebars.registerHelper('upper', (v: unknown) => String(v ?? '').toUpperCase());
    Handlebars.registerHelper('lower', (v: unknown) => String(v ?? '').toLowerCase());
    Handlebars.registerHelper('nowDate', () => dayjs().format('DD MMM YYYY HH:mm'));

    Handlebars.registerHelper('stateCode', (val: unknown) => {
      const str = String(val || '').trim();
      if (!str) return '';
      if (/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z0-9]{3}$/i.test(str)) {
        return str.substring(0, 2);
      }
      const stateMap: Record<string, string> = {
        'jammu & kashmir': '01', 'himachal pradesh': '02', 'punjab': '03', 'chandigarh': '04',
        'uttarakhand': '05', 'haryana': '06', 'delhi': '07', 'rajasthan': '08', 'uttar pradesh': '09',
        'bihar': '10', 'sikkim': '11', 'arunachal pradesh': '12', 'nagaland': '13', 'manipur': '14',
        'mizoram': '15', 'tripura': '16', 'meghalaya': '17', 'assam': '18', 'west bengal': '19',
        'jharkhand': '20', 'odisha': '21', 'orissa': '21', 'chhattisgarh': '22', 'madhya pradesh': '23',
        'gujarat': '24', 'daman & diu': '25', 'dadra & nagar haveli': '26', 'maharashtra': '27',
        'andhra pradesh': '37', 'karnataka': '29', 'goa': '30', 'lakshadweep': '31', 'kerala': '32',
        'tamil nadu': '33', 'puducherry': '34', 'andaman & nicobar islands': '35', 'telangana': '36', 'ladakh': '38'
      };
      return stateMap[str.toLowerCase()] || '';
    });

    Handlebars.registerHelper('formatAddress', (addr: Record<string, unknown> | undefined) => {
      if (!addr || typeof addr !== 'object') return '';
      const line1 = String(addr.line1 || '').trim();
      const line2 = String(addr.line2 || '').trim();
      const city = String(addr.city || '').trim();
      const state = String(addr.state || '').trim();
      const pincode = String(addr.pincode || '').trim();

      const lines: string[] = [];
      const street = [line1, line2].filter(Boolean).join(', ');
      if (street) lines.push(street);

      const cityParts = [city, state].filter(Boolean).join(', ');
      const cityStatePin = [cityParts, pincode].filter(Boolean).join(' - ');
      if (cityStatePin) lines.push(cityStatePin);

      return new Handlebars.SafeString(lines.join('<br/>'));
    });

    Handlebars.registerHelper('formatContactLine', (phone: unknown, email: unknown) => {
      const p = String(phone || '').trim();
      const e = String(email || '').trim();
      if (p && e) return new Handlebars.SafeString(`Ph: ${p} &bull; ${e}`);
      if (p) return `Ph: ${p}`;
      if (e) return e;
      return '';
    });

    const dir = this.templateDir();
    const basePath = join(dir, 'base.hbs');
    if (existsSync(basePath)) this.base = readFileSync(basePath, 'utf-8');

    for (const theme of THEMES) {
      const p = join(dir, `${theme}.hbs`);
      if (existsSync(p)) {
        Handlebars.registerPartial(`theme_${theme}`, readFileSync(p, 'utf-8'));
      }
    }
    const thermalPath = join(dir, 'thermal.hbs');
    if (existsSync(thermalPath)) Handlebars.registerPartial('theme_thermal', readFileSync(thermalPath, 'utf-8'));
  }

  render(data: InvoiceTemplateData): string {
    this.registerHelpers();
    const baseCompiler = Handlebars.compile(this.base);
    return baseCompiler(data);
  }
}
