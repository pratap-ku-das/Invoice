import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessDocument, BusinessDocumentSchema } from '../documents/document.schema';
import { Payment, PaymentSchema } from '../payments/payment.schema';
import { Expense, ExpenseSchema } from '../expenses/expense.schema';
import { ReportsService } from './reports.service';
import { GstService } from './gst.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BusinessDocument.name, schema: BusinessDocumentSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Expense.name, schema: ExpenseSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, GstService],
})
export class ReportsModule {}
