import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { SubscriptionPayment, SubscriptionPaymentSchema } from './subscription-payment.schema';
import { Company, CompanySchema } from '../company/company.schema';
import { User, UserSchema } from '../users/user.schema';
import { BusinessDocument, BusinessDocumentSchema } from '../documents/document.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubscriptionPayment.name, schema: SubscriptionPaymentSchema },
      { name: Company.name, schema: CompanySchema },
      { name: User.name, schema: UserSchema },
      { name: BusinessDocument.name, schema: BusinessDocumentSchema },
    ]),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
