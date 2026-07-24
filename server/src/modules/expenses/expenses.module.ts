import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Expense,
  ExpenseCategory,
  ExpenseCategorySchema,
  ExpenseSchema,
} from './expense.schema';
import { ExpenseCategoriesService, ExpensesService } from './expenses.service';
import { ExpenseCategoriesController, ExpensesController } from './expenses.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Expense.name, schema: ExpenseSchema },
      { name: ExpenseCategory.name, schema: ExpenseCategorySchema },
    ]),
  ],
  controllers: [ExpensesController, ExpenseCategoriesController],
  providers: [ExpensesService, ExpenseCategoriesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
