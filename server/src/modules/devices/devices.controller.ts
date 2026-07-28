import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DevicesService, RegisterDeviceDto } from './devices.service';

@ApiTags('Devices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register FCM device token for push notifications' })
  async register(@Request() req: any, @Body() dto: RegisterDeviceDto) {
    const userId = req.user.userId || req.user.id || req.user._id;
    const companyId = req.user.companyId || req.user.currentCompanyId || 'default';
    return this.devicesService.registerDevice(userId, companyId, dto);
  }

  @Get('my-devices')
  @ApiOperation({ summary: 'List user active registered devices' })
  async getMyDevices(@Request() req: any) {
    const userId = req.user.userId || req.user.id || req.user._id;
    return this.devicesService.getDevicesForUser(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a registered device' })
  async remove(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.userId || req.user.id || req.user._id;
    return { success: await this.devicesService.removeDevice(userId, id) };
  }
}
