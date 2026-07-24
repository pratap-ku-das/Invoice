import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessDocument, BusinessDocumentSchema } from '../documents/document.schema';
import { Payment, PaymentSchema } from '../payments/payment.schema';
import { Expense, ExpenseSchema } from '../expenses/expense.schema';
import { Product, ProductSchema } from '../catalog/product.schema';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PartiesModule } from '../parties/parties.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    PartiesModule,
    InventoryModule,
    MongooseModule.forFeature([
      { name: BusinessDocument.name, schema: BusinessDocumentSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
