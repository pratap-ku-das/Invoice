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
    // works both from src (dev) and dist (prod)
    const candidates = [
      join(__dirname, 'templates'),
      join(process.cwd(), 'src', 'modules', 'pdf', 'templates'),
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
    if (!this.compiled.has('base')) {
      this.compiled.set('base', Handlebars.compile(this.base));
    }
    return this.compiled.get('base')!(data);
  }
}
