import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppRelease, AppReleaseDocument } from './schemas/app-release.schema';

export interface CreateReleaseDto {
  version: string;
  buildNumber?: number;
  platform?: 'android' | 'windows' | 'web';
  fileType?: 'apk' | 'aab' | 'exe';
  forceUpdate?: boolean;
  minSupportedVersion?: string;
  message?: string;
  whatsNew?: string[];
}

@Injectable()
export class ReleasesService {
  private readonly logger = new Logger(ReleasesService.name);

  constructor(
    @InjectModel(AppRelease.name) private readonly releaseModel: Model<AppReleaseDocument>,
  ) {}

  async createRelease(
    dto: CreateReleaseDto,
    file?: Express.Multer.File,
  ): Promise<AppReleaseDocument> {
    let downloadUrl = `https://invoice.balajione.dev/download/invoice-v${dto.version}.${dto.fileType || 'apk'}`;
    let fileSize = 0;

    if (file) {
      downloadUrl = `/uploads/releases/${file.filename}`;
      fileSize = file.size;
    }

    const whatsNewArray = typeof dto.whatsNew === 'string'
      ? (dto.whatsNew as string).split('\n').filter(Boolean)
      : Array.isArray(dto.whatsNew)
        ? dto.whatsNew
        : [];

    const release = await this.releaseModel.create({
      version: dto.version,
      buildNumber: Number(dto.buildNumber) || 1,
      platform: dto.platform || 'android',
      fileType: dto.fileType || 'apk',
      downloadUrl,
      fileSize,
      forceUpdate: Boolean(dto.forceUpdate),
      minSupportedVersion: dto.minSupportedVersion || '1.0.0',
      message: dto.message || 'Next-Gen updates and performance improvements.',
      whatsNew: whatsNewArray,
      releaseDate: new Date(),
    });

    this.logger.log(`Created release v${dto.version} (${dto.platform})`);
    return release;
  }

  async getLatestRelease(platform = 'android'): Promise<AppReleaseDocument | null> {
    return this.releaseModel
      .findOne({ platform })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAllReleases(): Promise<AppReleaseDocument[]> {
    return this.releaseModel.find().sort({ createdAt: -1 }).exec();
  }

  async getAppVersionResponse(platform = 'android') {
    const latest = await this.getLatestRelease(platform);
    if (latest) {
      return {
        currentVersion: '1.0.3',
        latestVersion: latest.version,
        minimumVersion: latest.minSupportedVersion,
        apkUrl: latest.platform === 'android' ? latest.downloadUrl : '',
        desktopUrl: latest.platform === 'windows' ? latest.downloadUrl : '',
        downloadUrl: latest.downloadUrl,
        forceUpdate: latest.forceUpdate,
        message: latest.message,
        whatsNew: latest.whatsNew,
        releaseDate: latest.releaseDate,
      };
    }

    return {
      currentVersion: '1.0.3',
      latestVersion: '1.0.3',
      minimumVersion: '1.0.0',
      apkUrl: 'https://invoice.balajione.dev/download/invoice-v1.0.3.apk',
      desktopUrl: 'https://invoice.balajione.dev/download/invoice-v1.0.3.exe',
      downloadUrl: 'https://invoice.balajione.dev/download/invoice-v1.0.3.apk',
      forceUpdate: false,
      message: 'Next-Gen AI Copilot, Vector PDF Engine & Performance Improvements.',
      whatsNew: [
        'Gemini 1.5 AI Copilot with real-time financial Q&A',
        'Professional Vyapar PDF Invoice Engine & Vector Previewer',
        'Smart table context menus with zero container clipping',
        'General stability & logo branding updates',
      ],
      releaseDate: new Date().toISOString(),
    };
  }
}
