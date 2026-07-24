import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { StockMovement, StockMovementDocument, StockMovementType } from './stock-movement.schema';
import { Product, ProductDocument } from '../catalog/product.schema';
import { PaginationQueryDto, paginate } from '../../common/dto/pagination.dto';

export interface StockChange {
  productId: string | Types.ObjectId;
  qty: number; // signed
  rate?: number;
  type: StockMovementType;
  refType?: string;
  refId?: Types.ObjectId;
  refNumber?: string;
  warehouse?: string;
  toWarehouse?: string;
  note?: string;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(StockMovement.name) private movementModel: Model<StockMovementDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  /**
   * Apply a set of stock changes atomically (within the caller's session).
   * Enforces negative-stock protection unless allowed.
   */
  async applyChanges(
    companyId: string,
    userId: string,
    changes: StockChange[],
    opts: { session?: ClientSession; allowNegative?: boolean } = {},
  ) {
    const { session, allowNegative = false } = opts;

    for (const change of changes) {
      if (!change.qty) continue;

      const product = await this.productModel
        .findOne({ _id: change.productId, companyId: new Types.ObjectId(companyId) })
        .session(session ?? null);
      if (!product) throw new BadRequestException(`Product not found: ${change.productId}`);
      if (product.itemType === 'service') continue; // services don't track stock

      const newStock = (product.stock?.current ?? 0) + change.qty;
      if (newStock < 0 && !allowNegative) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}" (available: ${product.stock?.current ?? 0}, required: ${-change.qty})`,
        );
      }

      product.stock.current = newStock;
      await product.save({ session });

      await this.movementModel.create(
        [
          {
            companyId: new Types.ObjectId(companyId),
            productId: product._id,
            type: change.type,
            qty: change.qty,
            rate: change.rate ?? 0,
            refType: change.refType,
            refId: change.refId,
            refNumber: change.refNumber,
            warehouse: change.warehouse ?? product.warehouse,
            toWarehouse: change.toWarehouse,
            note: change.note,
            balanceAfter: newStock,
            createdBy: new Types.ObjectId(userId),
          },
        ],
        { session },
      );
    }
  }

  /** Reverse all stock movements linked to a document (edit/cancel/delete) */
  async reverseForRef(
    companyId: string,
    userId: string,
    refType: string,
    refId: Types.ObjectId,
    session?: ClientSession,
  ) {
    const movements = await this.movementModel
      .find({ companyId: new Types.ObjectId(companyId), refType, refId })
      .session(session ?? null);

    const reversals: StockChange[] = movements
      .filter((m) => m.qty !== 0)
      .map((m) => ({
        productId: m.productId,
        qty: -m.qty,
        rate: m.rate,
        type: 'adjust' as StockMovementType,
        refType: `${refType}-reversal`,
        refId,
        note: `Reversal of ${m.refNumber ?? refType}`,
      }));

    // Reversal must always succeed even if it would go negative
    await this.applyChanges(companyId, userId, reversals, { session, allowNegative: true });

    // Detach original movements so a re-apply doesn't double-reverse
    await this.movementModel.updateMany(
      { companyId: new Types.ObjectId(companyId), refType, refId },
      { $set: { refType: `${refType}-reversed` } },
      { session },
    );
  }

  async movements(companyId: string, query: PaginationQueryDto & { productId?: string; type?: string }) {
    const { page = 1, limit = 20, productId, type } = query;
    const filter: Record<string, unknown> = { companyId: new Types.ObjectId(companyId) };
    if (productId) filter.productId = new Types.ObjectId(productId);
    if (type) filter.type = type;

    const [data, total] = await Promise.all([
      this.movementModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.movementModel.countDocuments(filter),
    ]);
    return paginate(data, total, page, limit);
  }

  async lowStock(companyId: string) {
    return this.productModel
      .find({
        companyId: new Types.ObjectId(companyId),
        deletedAt: null,
        itemType: 'product',
        $expr: { $lte: ['$stock.current', '$stock.minimum'] },
        'stock.minimum': { $gt: 0 },
      })
      .select('name sku stock unitId')
      .lean();
  }

  async stockValue(companyId: string) {
    const rows = await this.productModel.aggregate([
      { $match: { companyId: new Types.ObjectId(companyId), deletedAt: null, itemType: 'product' } },
      {
        $group: {
          _id: null,
          value: { $sum: { $multiply: ['$stock.current', '$purchasePrice'] } },
          items: { $sum: 1 },
          qty: { $sum: '$stock.current' },
        },
      },
    ]);
    return rows[0] ?? { value: 0, items: 0, qty: 0 };
  }
}
