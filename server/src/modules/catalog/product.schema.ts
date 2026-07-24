import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ _id: false })
export class ProductVariant {
  @Prop() name: string; // e.g. "Red / XL"
  @Prop() sku?: string;
  @Prop() barcode?: string;
  @Prop() sellingPrice?: number;
  @Prop() purchasePrice?: number;
  @Prop({ default: 0 }) stock: number;
  @Prop({ type: Object, default: {} }) attributes: Record<string, string>; // {color: 'Red', size: 'XL'}
}

@Schema({ _id: false })
export class ProductStock {
  @Prop({ default: 0 }) current: number;
  @Prop({ default: 0 }) opening: number;
  @Prop({ default: 0 }) minimum: number; // low-stock threshold
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true }) sku?: string;
  @Prop({ trim: true }) barcode?: string;
  @Prop({ type: Types.ObjectId }) categoryId?: Types.ObjectId;
  @Prop({ trim: true }) brand?: string;
  @Prop({ type: Types.ObjectId }) unitId?: Types.ObjectId;

  @Prop({ default: 0 }) purchasePrice: number;
  @Prop({ default: 0 }) sellingPrice: number;
  @Prop({ default: 0 }) mrp: number;
  @Prop({ default: false }) taxInclusive: boolean;

  @Prop({ default: 0 }) gstRate: number;
  @Prop({ default: 0 }) cessRate: number;
  @Prop({ trim: true }) hsn?: string;

  @Prop({ type: ProductStock, default: {} })
  stock: ProductStock;

  @Prop({ default: 'main' }) warehouse: string;
  @Prop({ type: [String], default: [] }) images: string[];
  @Prop() description?: string;

  @Prop({ type: [ProductVariant], default: [] })
  variants: ProductVariant[];

  @Prop({ default: false }) batchTracking: boolean;
  @Prop() expiryDate?: Date;
  @Prop({ type: [String], default: [] }) serialNumbers: string[];

  /** service items don't track stock */
  @Prop({ type: String, enum: ['product', 'service'], default: 'product' })
  itemType: 'product' | 'service';

  @Prop({ default: true }) isActive: boolean;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Date, default: null, index: true })
  deletedAt?: Date | null;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ companyId: 1, name: 1 });
ProductSchema.index(
  { companyId: 1, sku: 1 },
  { unique: true, partialFilterExpression: { sku: { $type: 'string' }, deletedAt: null } },
);
ProductSchema.index({ companyId: 1, barcode: 1 });
ProductSchema.index({ companyId: 1, 'stock.current': 1 });
