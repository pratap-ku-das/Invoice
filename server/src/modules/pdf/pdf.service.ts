import { Injectable, OnModuleDestroy } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';

export type PaperSize = 'A4' | 'thermal-58' | 'thermal-80';
export type Orientation = 'portrait' | 'landscape';

interface RenderOptions {
  paperSize?: PaperSize;
  orientation?: Orientation;
  marginMm?: number;
}

/**
 * Singleton headless browser. Pages are created per-render and closed
 * immediately to keep memory flat under bulk generation.
 */
@Injectable()
export class PdfService implements OnModuleDestroy {
  private browser: Browser | null = null;
  private launching: Promise<Browser> | null = null;

  private async getBrowser(): Promise<Browser> {
    if (this.browser?.connected) return this.browser;
    if (this.launching) return this.launching;
    this.launching = puppeteer
      .launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      })
      .then((b) => {
        this.browser = b;
        this.launching = null;
        return b;
      });
    return this.launching;
  }

  async htmlToPdf(html: string, options: RenderOptions = {}): Promise<Buffer> {
    const { paperSize = 'A4', orientation = 'portrait', marginMm = 10 } = options;
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const widths: Record<PaperSize, string | undefined> = {
        A4: undefined,
        'thermal-58': '58mm',
        'thermal-80': '80mm',
      };

      if (paperSize.startsWith('thermal')) {
        const heightPx = await page.evaluate(() => document.body.scrollHeight);
        return Buffer.from(
          await page.pdf({
            width: widths[paperSize],
            height: `${Math.ceil(heightPx * 0.2646 + 4)}mm`,
            printBackground: true,
            margin: { top: '2mm', bottom: '2mm', left: '2mm', right: '2mm' },
          }),
        );
      }

      return Buffer.from(
        await page.pdf({
          format: 'A4',
          landscape: orientation === 'landscape',
          printBackground: true,
          margin: {
            top: `${marginMm}mm`,
            bottom: `${marginMm}mm`,
            left: `${marginMm}mm`,
            right: `${marginMm}mm`,
          },
        }),
      );
    } finally {
      await page.close();
    }
  }

  async onModuleDestroy() {
    await this.browser?.close();
  }
}
