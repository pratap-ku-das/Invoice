import { Injectable, Logger } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface AppUpdateCheckResponse {
  latestVersion: string;
  downloadUrl: string;
  forceUpdate: boolean;
  message: string;
  whatsNew: string[];
  releaseDate?: string;
}

@Injectable()
export class AppUpdateService {
  private readonly logger = new Logger(AppUpdateService.name);

  getLatestVersionInfo(): AppUpdateCheckResponse {
    const versionFilePath = join(process.cwd(), 'version.json');
    if (existsSync(versionFilePath)) {
      try {
        const rawData = readFileSync(versionFilePath, 'utf-8');
        const parsed = JSON.parse(rawData);
        return {
          latestVersion: parsed.latestVersion || '1.0.0',
          downloadUrl: parsed.downloadUrl || 'https://invoice.balajione.dev/download',
          forceUpdate: Boolean(parsed.forceUpdate),
          message: parsed.message || 'A new update is available for BalajiOne Invoice.',
          whatsNew: Array.isArray(parsed.whatsNew) ? parsed.whatsNew : [],
          releaseDate: parsed.releaseDate,
        };
      } catch (err) {
        this.logger.error('Failed to parse version.json', err);
      }
    }

    return {
      latestVersion: '1.0.3',
      downloadUrl: 'https://invoice.balajione.dev/download/invoice-v1.0.3.apk',
      forceUpdate: false,
      message: 'Next-Gen AI Copilot, Vector PDF Engine & Performance Improvements.',
      whatsNew: [
        'Gemini 1.5 AI Copilot with real-time financial Q&A',
        'Professional Vyapar PDF Invoice Engine & Vector Previewer',
        'Smart table context menus with zero container clipping',
        'General stability & logo branding updates',
      ],
      releaseDate: '2026-07-28',
    };
  }
}
