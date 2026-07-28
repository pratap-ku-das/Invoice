import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/roles.decorator';
import { AppUpdateService, AppUpdateCheckResponse } from './app-update.service';

@ApiTags('App Update')
@Controller('app-update')
export class AppUpdateController {
  constructor(private readonly appUpdateService: AppUpdateService) {}

  @Public()
  @Get('check')
  @ApiOperation({ summary: 'Check latest app version and self-hosted APK download link' })
  checkVersion(): AppUpdateCheckResponse {
    return this.appUpdateService.getLatestVersionInfo();
  }
}
