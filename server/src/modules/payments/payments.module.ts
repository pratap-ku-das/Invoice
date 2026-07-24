import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './payment.schema';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { DocumentsModule } from '../documents/documents.module';
import { PartiesModule } from '../parties/parties.module';

@Module({
  imports: [
    DocumentsModule,
    PartiesModule,
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
