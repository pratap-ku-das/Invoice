import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';

/**
 * Base fields shared by every business document:
 * - companyId: multi-tenancy scope (indexed on every schema)
 * - createdBy: user reference
 * - deletedAt: soft delete → recycle bin
 */
@Schema()
export class BaseDoc {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Date, default: null, index: true })
  deletedAt?: Date | null;
}

/** Standard filter to exclude soft-deleted docs */
export const notDeleted = { deletedAt: null };
