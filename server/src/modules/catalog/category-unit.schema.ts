import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: Types.ObjectId, default: null })
  parentId?: Types.ObjectId | null;

  @Prop() description?: string;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Date, default: null, index: true })
  deletedAt?: Date | null;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index({ companyId: 1, name: 1 });

export type UnitDocument = HydratedDocument<Unit>;

@Schema({ timestamps: true })
export class Unit {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string; // Pieces

  @Prop({ required: true, trim: true })
  shortName: string; // PCS

  /** e.g. 1 BOX = 12 PCS → { unitId: <PCS>, factor: 12 } */
  @Prop({
    type: [{ unitId: { type: Types.ObjectId }, factor: Number }],
    default: [],
  })
  conversions: { unitId: Types.ObjectId; factor: number }[];

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Date, default: null, index: true })
  deletedAt?: Date | null;
}

export const UnitSchema = SchemaFactory.createForClass(Unit);
UnitSchema.index({ companyId: 1, shortName: 1 });
