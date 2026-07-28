import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppRelease, AppReleaseSchema } from './schemas/app-release.schema';
import { ReleasesService } from './releases.service';
import { ReleasesController } from './releases.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AppRelease.name, schema: AppReleaseSchema }]),
  ],
  providers: [ReleasesService],
  controllers: [ReleasesController],
  exports: [ReleasesService],
})
export class ReleasesModule {}
