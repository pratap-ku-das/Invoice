import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import dayjs from 'dayjs';
import {
  Expense,
  ExpenseCategory,
  ExpenseCategoryDocument,
  ExpenseDocument,
} from './expense.schema';
import { BaseCrudService } from '../../common/services/base-crud.service';
import { PaginationQueryDto, paginate } from '../../common/dto/pagination.dto';
import { NumberSequenceService } from '../company/number-sequence.service';
import { escapeRegex } from '../../common/services/base-crud.service';

@Injectable()
export class ExpenseCategoriesService extends BaseCrudService<ExpenseCategory> {
  constructor(@InjectModel(ExpenseCategory.name) model: Model<ExpenseCategoryDocument>) {
    super(model as unknown as Model<ExpenseCategory>, ['name']);
  }
}

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    @InjectModel(ExpenseCategory.name) private categoryModel: Model<ExpenseCategoryDocument>,
    private numberSeq: NumberSequenceService,
  ) {}

  async list(
    companyId: string,
    query: PaginationQueryDto & { categoryId?: string; from?: string; to?: string },
  ) {
    const { page = 1, limit = 20, search, categoryId, from, to } = query;
    const filter: Record<string, unknown> = {
      companyId: new Types.ObjectId(companyId),
      deletedAt: null,
    };
    if (categoryId) filter.categoryId = new Types.ObjectId(categoryId);
    if (from || to) {
      const range: Record<string, Date> = {};
      if (from) range.$gte = new Date(from);
      if (to) range.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
      filter.date = range;
    }
    if (search) {
      filter.$or = [
        { number: { $regex: escapeRegex(search), $options: 'i' } },
        { note: { $regex: escapeRegex(search), $options: 'i' } },
        { categoryName: { $regex: escapeRegex(search), $options: 'i' } },
      ];
    }

    const [data, total, sum] = await Promise.all([
      this.expenseModel.find(filter).sort({ date: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      this.expenseModel.countDocuments(filter),
      this.expenseModel.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);
    return { ...paginate(data, total, page, limit), summary: { total: sum[0]?.total ?? 0 } };
  }

  async create(companyId: string, userId: string, dto: Record<string, unknown>) {
    const amount = Number(dto.amount) || 0;
    const taxRate = Number(dto.taxRate) || 0;
    const taxAmount = Math.round(((amount * taxRate) / 100) * 100) / 100;
    const number = await this.numberSeq.nextNumber(companyId, 'expense');

    let categoryName = dto.categoryName as string | undefined;
    if (dto.categoryId && !categoryName) {
      const cat = await this.categoryModel.findById(dto.categoryId).lean();
      categoryName = cat?.name;
    }

    const expense = await this.expenseModel.create({
      ...dto,
      number,
      companyId: new Types.ObjectId(companyId),
      createdBy: new Types.ObjectId(userId),
      categoryId: dto.categoryId ? new Types.ObjectId(dto.categoryId as string) : undefined,
      categoryName,
      taxAmount,
      total: Math.round((amount + taxAmount) * 100) / 100,
      nextRunDate: dto.isRecurring
        ? this.computeNextRun(new Date(dto.date as string), dto.recurringFrequency as string)
        : undefined,
    });
    return expense.toObject();
  }

  async update(companyId: string, id: string, dto: Record<string, unknown>) {
    if (dto.amount !== undefined || dto.taxRate !== undefined) {
      const current = await this.expenseModel.findById(id).lean();
      const amount = Number(dto.amount ?? current?.amount) || 0;
      const taxRate = Number(dto.taxRate ?? current?.taxRate) || 0;
      dto.taxAmount = Math.round(((amount * taxRate) / 100) * 100) / 100;
      dto.total = Math.round((amount + (dto.taxAmount as number)) * 100) / 100;
    }
    const expense = await this.expenseModel
      .findOneAndUpdate(
        { _id: id, companyId: new Types.ObjectId(companyId), deletedAt: null },
        { $set: dto },
        { new: true },
      )
      .lean();
    return expense;
  }

  async remove(companyId: string, id: string) {
    await this.expenseModel.updateOne(
      { _id: id, companyId: new Types.ObjectId(companyId) },
      { $set: { deletedAt: new Date() } },
    );
    return { deleted: true };
  }

  private computeNextRun(from: Date, freq: string): Date {
    const map: Record<string, dayjs.ManipulateType> = {
      daily: 'day',
      weekly: 'week',
      monthly: 'month',
      yearly: 'year',
    };
    return dayjs(from).add(1, map[freq] ?? 'month').toDate();
  }

  /** Generate due recurring expenses (called by cron) */
  async runRecurring() {
    const now = new Date();
    const due = await this.expenseModel.find({
      isRecurring: true,
      deletedAt: null,
      nextRunDate: { $lte: now },
    });
    for (const template of due) {
      const number = await this.numberSeq.nextNumber(String(template.companyId), 'expense');
      await this.expenseModel.create({
        ...template.toObject(),
        _id: undefined,
        number,
        date: template.nextRunDate,
        isRecurring: false,
        createdAt: undefined,
        updatedAt: undefined,
      });
      template.nextRunDate = this.computeNextRun(
        template.nextRunDate ?? now,
        template.recurringFrequency ?? 'monthly',
      );
      await template.save();
    }
    return { generated: due.length };
  }
}
