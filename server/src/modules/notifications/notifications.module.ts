import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './notification.schema';
import { NotificationLog, NotificationLogSchema } from './schemas/notification-log.schema';
import { BusinessDocument, BusinessDocumentSchema } from '../documents/document.schema';
import { Product, ProductSchema } from '../catalog/product.schema';
import { Company, CompanySchema } from '../company/company.schema';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { FcmService } from './fcm.service';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: NotificationLog.name, schema: NotificationLogSchema },
      { name: BusinessDocument.name, schema: BusinessDocumentSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
    DevicesModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, FcmService],
  exports: [NotificationsService, FcmService],
})
export class NotificationsModule {}
