import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { Category, CategoryDocument, Unit, UnitDocument } from './category-unit.schema';
import { BaseCrudService } from '../../common/services/base-crud.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class ProductsService extends BaseCrudService<Product> {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly inventoryService: InventoryService,
  ) {
    super(productModel as unknown as Model<Product>, ['name', 'sku', 'barcode', 'hsn', 'brand']);
  }

  async listProducts(
    companyId: string,
    query: PaginationQueryDto & { categoryId?: string; lowStock?: string; itemType?: string },
  ) {
    const extra: Record<string, unknown> = {};
    if (query.categoryId) extra.categoryId = new Types.ObjectId(query.categoryId);
    if (query.itemType) extra.itemType = query.itemType;
    if (query.lowStock === 'true') {
      extra.$expr = { $lte: ['$stock.current', '$stock.minimum'] };
      extra['stock.minimum'] = { $gt: 0 };
    }
    return this.findAll(companyId, query, extra);
  }

  /** Exact barcode/SKU lookup for scanner input */
  async findByCode(companyId: string, code: string) {
    return this.productModel
      .findOne({
        companyId: new Types.ObjectId(companyId),
        deletedAt: null,
        $or: [{ barcode: code }, { sku: code }],
      })
      .lean();
  }

  async createProduct(companyId: string, userId: string, dto: Partial<Product>) {
    const opening = dto.stock?.opening ?? 0;
    const product = await this.create(companyId, userId, {
      ...dto,
      stock: { current: 0, opening, minimum: dto.stock?.minimum ?? 0 },
    } as Partial<Product>);

    if (opening > 0) {
      await this.inventoryService.applyChanges(companyId, userId, [
        {
          productId: (product as Product & { _id: Types.ObjectId })._id,
          qty: opening,
          rate: dto.purchasePrice ?? 0,
          type: 'opening',
          refType: 'opening-stock',
          note: 'Opening stock',
        },
      ]);
      (product as Product).stock.current = opening;
    }
    return product;
  }

  /** Auto-generate a unique SKU */
  async generateSku(companyId: string, name: string) {
    const base = name
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim()
      .split(/\s+/)
      .map((w) => w.slice(0, 3).toUpperCase())
      .slice(0, 2)
      .join('');
    const count = await this.productModel.countDocuments({
      companyId: new Types.ObjectId(companyId),
    });
    return `${base || 'PRD'}-${String(count + 1).padStart(4, '0')}`;
  }
}

@Injectable()
export class CategoriesService extends BaseCrudService<Category> {
  constructor(@InjectModel(Category.name) categoryModel: Model<CategoryDocument>) {
    super(categoryModel as unknown as Model<Category>, ['name']);
  }
}

@Injectable()
export class UnitsService extends BaseCrudService<Unit> {
  constructor(@InjectModel(Unit.name) private unitModel: Model<UnitDocument>) {
    super(unitModel as unknown as Model<Unit>, ['name', 'shortName']);
  }

  /** Seed common Indian units for a new company */
  async seedDefaults(companyId: string, userId: string) {
    const count = await this.unitModel.countDocuments({
      companyId: new Types.ObjectId(companyId),
    });
    if (count > 0) return;
    const defaults = [
      { name: 'Pieces', shortName: 'PCS' },
      { name: 'Kilograms', shortName: 'KG' },
      { name: 'Grams', shortName: 'GM' },
      { name: 'Litres', shortName: 'LTR' },
      { name: 'Metres', shortName: 'MTR' },
      { name: 'Box', shortName: 'BOX' },
      { name: 'Dozen', shortName: 'DZN' },
      { name: 'Packets', shortName: 'PKT' },
      { name: 'Numbers', shortName: 'NOS' },
      { name: 'Bags', shortName: 'BAG' },
    ];
    await this.unitModel.insertMany(
      defaults.map((d) => ({
        ...d,
        companyId: new Types.ObjectId(companyId),
        createdBy: new Types.ObjectId(userId),
      })),
    );
  }
}
