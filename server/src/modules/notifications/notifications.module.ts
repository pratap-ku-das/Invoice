import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './notification.schema';
import { BusinessDocument, BusinessDocumentSchema } from '../documents/document.schema';
import { Product, ProductSchema } from '../catalog/product.schema';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: BusinessDocument.name, schema: BusinessDocumentSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
