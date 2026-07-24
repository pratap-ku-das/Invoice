import { NotFoundException } from '@nestjs/common';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { Paginated, PaginationQueryDto, paginate } from '../dto/pagination.dto';
import { notDeleted } from '../schemas/base.schema';

/**
 * Generic company-scoped CRUD service with soft delete + server-side pagination.
 * All master modules (customers, suppliers, products, categories, units...) extend this.
 */
export abstract class BaseCrudService<T extends { companyId: Types.ObjectId }> {
  protected constructor(
    protected readonly model: Model<T>,
    /** Fields matched by the `search` query param (regex, case-insensitive) */
    protected readonly searchFields: string[] = ['name'],
  ) {}

  protected scope(companyId: string, extra: FilterQuery<T> = {}): FilterQuery<T> {
    return {
      companyId: new Types.ObjectId(companyId),
      ...notDeleted,
      ...extra,
    } as FilterQuery<T>;
  }

  async findAll(
    companyId: string,
    query: PaginationQueryDto,
    extraFilter: FilterQuery<T> = {},
  ): Promise<Paginated<T>> {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const filter = this.scope(companyId, extraFilter);

    if (search && this.searchFields.length) {
      (filter as Record<string, unknown>).$or = this.searchFields.map((f) => ({
        [f]: { $regex: escapeRegex(search), $options: 'i' },
      }));
    }

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<T[]>(),
      this.model.countDocuments(filter),
    ]);

    return paginate(data, total, page, limit);
  }

  async findOne(companyId: string, id: string): Promise<T> {
    const doc = await this.model.findOne(this.scope(companyId, { _id: id } as FilterQuery<T>)).lean<T>();
    if (!doc) throw new NotFoundException(`${this.model.modelName} not found`);
    return doc;
  }

  async create(companyId: string, userId: string, dto: Partial<T>): Promise<T> {
    const doc = await this.model.create({
      ...dto,
      companyId: new Types.ObjectId(companyId),
      createdBy: new Types.ObjectId(userId),
    });
    return doc.toObject() as T;
  }

  async update(companyId: string, id: string, dto: UpdateQuery<T>): Promise<T> {
    const doc = await this.model
      .findOneAndUpdate(this.scope(companyId, { _id: id } as FilterQuery<T>), dto, { new: true })
      .lean<T>();
    if (!doc) throw new NotFoundException(`${this.model.modelName} not found`);
    return doc;
  }

  /** Soft delete → recycle bin */
  async softDelete(companyId: string, id: string): Promise<{ deleted: true }> {
    const doc = await this.model.findOneAndUpdate(
      this.scope(companyId, { _id: id } as FilterQuery<T>),
      { deletedAt: new Date() } as UpdateQuery<T>,
      { new: true },
    );
    if (!doc) throw new NotFoundException(`${this.model.modelName} not found`);
    return { deleted: true };
  }

  async restore(companyId: string, id: string): Promise<T> {
    const doc = await this.model
      .findOneAndUpdate(
        {
          companyId: new Types.ObjectId(companyId),
          _id: id,
          deletedAt: { $ne: null },
        } as FilterQuery<T>,
        { deletedAt: null } as UpdateQuery<T>,
        { new: true },
      )
      .lean<T>();
    if (!doc) throw new NotFoundException(`${this.model.modelName} not found in recycle bin`);
    return doc;
  }
}

export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
