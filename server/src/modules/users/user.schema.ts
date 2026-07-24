import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from '../../common/constants/roles';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ trim: true })
  mobile?: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ type: String, enum: Object.values(Role), default: Role.ADMIN })
  role: Role;

  @Prop({ type: Types.ObjectId, index: true })
  companyId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ select: false })
  refreshTokenHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
