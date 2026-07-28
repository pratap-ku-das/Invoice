import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BackupService } from './backup.service';

@ApiTags('Backup')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get('export')
  @ApiOperation({ summary: 'Export complete company data backup (JSON)' })
  async exportBackup(@CurrentUser('companyId') companyId: string) {
    return this.backupService.exportBackup(companyId);
  }

  @Post('restore')
  @ApiOperation({ summary: 'Restore company data from JSON backup' })
  async restoreBackup(@CurrentUser('companyId') companyId: string, @Body() payload: any) {
    return this.backupService.restoreBackup(companyId, payload);
  }
}
