import { Controller, Get, Param, Patch, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(
    @CurrentUser('companyId') companyId: string,
    @Query('unread') unread?: string,
  ) {
    return this.notifications.list(companyId, unread === 'true');
  }

  @Get('unread-count')
  unreadCount(@CurrentUser('companyId') companyId: string) {
    return this.notifications.unreadCount(companyId);
  }

  @Post('scan')
  scan(@CurrentUser('companyId') companyId: string) {
    return this.notifications.scan(companyId);
  }

  @Patch(':id/read')
  markRead(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.notifications.markRead(companyId, id);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser('companyId') companyId: string) {
    return this.notifications.markAllRead(companyId);
  }

  @Post('send-broadcast')
  sendBroadcast(@CurrentUser('userId') userId: string, @Body() dto: any) {
    return this.notifications.sendBroadcastNotification(userId, dto);
  }

  @Get('admin/logs')
  getAdminLogs() {
    return this.notifications.getAdminNotificationLogs();
  }
}
