import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from '../../common/constants/roles';

export type MembershipDocument = HydratedDocument<Membership>;

/**
 * Links a user to a company with a per-company role.
 * A user with several memberships owns/belongs to several companies;
 * `isDefault` marks the one loaded at login.
 */
@Schema({ timestamps: true })
export class Membership {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(Role), required: true })
  role: Role;

  @Prop({ default: false })
  isDefault: boolean;

  /** creator of the company (counts toward the per-user company limit) */
  @Prop({ default: false })
  isOwner: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);
MembershipSchema.index({ userId: 1, companyId: 1 }, { unique: true });
