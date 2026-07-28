import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from './schemas/device.schema';

export interface RegisterDeviceDto {
  platform: 'android' | 'windows' | 'web';
  fcmToken: string;
  appVersion?: string;
  deviceModel?: string;
  osVersion?: string;
}

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    @InjectModel(Device.name) private readonly deviceModel: Model<DeviceDocument>,
  ) {}

  async registerDevice(
    userId: string,
    companyId: string,
    dto: RegisterDeviceDto,
  ): Promise<DeviceDocument> {
    const { platform, fcmToken, appVersion, deviceModel, osVersion } = dto;

    const device = await this.deviceModel.findOneAndUpdate(
      { fcmToken },
      {
        userId,
        companyId,
        platform: platform || 'web',
        fcmToken,
        appVersion: appVersion || '1.0.3',
        deviceModel: deviceModel || '',
        osVersion: osVersion || '',
        lastActiveAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    this.logger.log(`Device registered: ${userId} (${platform}) - Token: ${fcmToken.slice(0, 10)}...`);
    return device;
  }

  async getDevicesForUser(userId: string): Promise<DeviceDocument[]> {
    return this.deviceModel.find({ userId }).exec();
  }

  async getTokensByTarget(
    targetType: 'all' | 'company' | 'subscription' | 'role' | 'user',
    targetId?: string,
  ): Promise<string[]> {
    let filter: any = {};

    if (targetType === 'company' && targetId) {
      filter = { companyId: targetId };
    } else if (targetType === 'user' && targetId) {
      filter = { userId: targetId };
    }

    const devices = await this.deviceModel.find(filter).select('fcmToken').lean();
    return Array.from(new Set(devices.map((d) => d.fcmToken).filter(Boolean)));
  }

  async removeDevice(userId: string, deviceId: string): Promise<boolean> {
    const res = await this.deviceModel.deleteOne({ _id: deviceId, userId }).exec();
    return res.deletedCount > 0;
  }
}
