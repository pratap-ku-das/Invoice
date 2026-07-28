import { Injectable, OnModuleDestroy } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

function findChromeExecutable(): string | undefined {
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const systemPaths = [
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  for (const p of systemPaths) {
    if (fs.existsSync(p)) return p;
  }

  try {
    const defaultPath = puppeteer.executablePath();
    if (fs.existsSync(defaultPath)) return defaultPath;
  } catch (e) {}

  const searchDirs = [
    path.join(process.cwd(), '.cache'),
    path.join(process.cwd(), 'server', '.cache'),
    '/opt/render/.cache',
  ];

  for (const dir of searchDirs) {
    if (!fs.existsSync(dir)) continue;
    const found = searchForChromeFile(dir);
    if (found) return found;
  }

  return undefined;
}

function searchForChromeFile(dir: string): string | undefined {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const sub = searchForChromeFile(fullPath);
        if (sub) return sub;
      } else if (
        entry.name === 'chrome.exe' ||
        entry.name === 'chrome' ||
        entry.name === 'chrome-linux' ||
        entry.name === 'msedge.exe'
      ) {
        return fullPath;
      }
    }
  } catch (e) {}
  return undefined;
}

export type PaperSize = 'A4' | 'thermal-58' | 'thermal-80';
export type Orientation = 'portrait' | 'landscape';

interface RenderOptions {
  paperSize?: PaperSize;
  orientation?: Orientation;
  marginMm?: number;
}

@Injectable()
export class PdfService implements OnModuleDestroy {
  private browser: Browser | null = null;
  private launching: Promise<Browser> | null = null;

  private async getBrowser(): Promise<Browser> {
    if (this.browser?.connected) return this.browser;
    if (this.launching) return this.launching;

    const execPath = findChromeExecutable();

    this.launching = puppeteer
      .launch({
        headless: true,
        ...(execPath ? { executablePath: execPath } : {}),
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
        ],
      })
      .then((b) => {
        this.browser = b;
        this.launching = null;
        return b;
      })
      .catch((err) => {
        this.launching = null;
        throw err;
      });
    return this.launching;
  }

  async htmlToPdf(html: string, options: RenderOptions = {}): Promise<Buffer> {
    const { paperSize = 'A4', orientation = 'portrait', marginMm = 8 } = options;
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    try {
      await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 15000 });
      try {
        await Promise.race([
          page.evaluateHandle('document.fonts.ready'),
          new Promise((resolve) => setTimeout(resolve, 2000)),
        ]);
      } catch {}

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
          displayHeaderFooter: false,
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
