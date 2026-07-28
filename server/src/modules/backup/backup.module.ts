import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessDocument, BusinessDocumentSchema } from '../documents/document.schema';
import { Product, ProductSchema } from '../catalog/product.schema';
import { Party, PartySchema } from '../parties/party.schema';
import { Expense, ExpenseSchema } from '../expenses/expense.schema';
import { Company, CompanySchema } from '../company/company.schema';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BusinessDocument.name, schema: BusinessDocumentSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Party.name, schema: PartySchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
  ],
  providers: [BackupService],
  controllers: [BackupController],
  exports: [BackupService],
})
export class BackupModule {}
