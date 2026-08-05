import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ReleasesService, CreateReleaseDto } from './releases.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

const uploadDir = join(process.cwd(), 'uploads', 'releases');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@ApiTags('Releases')
@Controller()
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

  @Get('releases/check')
  @ApiOperation({ summary: 'Check OTA updates for Android Capacitor clients' })
  async checkOTA(@Query('platform') platform?: string) {
    return this.releasesService.getAppVersionResponse(platform || 'android');
  }

  @Get('app/version')
  @ApiOperation({ summary: 'Master endpoint for mobile/desktop app version check' })
  async getAppVersion(@Query('platform') platform?: string) {
    return this.releasesService.getAppVersionResponse(platform || 'android');
  }

  @Get('releases/latest')
  @ApiOperation({ summary: 'Get latest app release' })
  async getLatest(@Query('platform') platform?: string) {
    return this.releasesService.getLatestRelease(platform || 'android');
  }

  @Get('releases')
  @ApiOperation({ summary: 'List all app releases' })
  async getAll() {
    return this.releasesService.getAllReleases();
  }

  @Post('releases/upload')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload new APK, AAB, or EXE release' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `release-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 200 * 1024 * 1024 }, // 200MB max limit
    }),
  )
  async uploadRelease(
    @Body() dto: CreateReleaseDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.releasesService.createRelease(dto, file);
  }
}
