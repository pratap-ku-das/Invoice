import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as argon2 from 'argon2';
import { User, UserDocument } from './user.schema';
import { Role } from '../../common/constants/roles';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async list(companyId: string) {
    return this.userModel.find({ companyId: new Types.ObjectId(companyId) }).lean();
  }

  async create(
    companyId: string,
    dto: { name: string; email: string; password: string; role: Role },
  ) {
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) throw new BadRequestException('Email already in use');
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash: await argon2.hash(dto.password),
      role: dto.role,
      companyId: new Types.ObjectId(companyId),
    });
    const { passwordHash: _p, ...rest } = user.toObject();
    return rest;
  }

  async update(
    companyId: string,
    id: string,
    dto: { name?: string; role?: Role; isActive?: boolean; password?: string },
  ) {
    const $set: Record<string, unknown> = {};
    if (dto.name !== undefined) $set.name = dto.name;
    if (dto.role !== undefined) $set.role = dto.role;
    if (dto.isActive !== undefined) $set.isActive = dto.isActive;
    if (dto.password) $set.passwordHash = await argon2.hash(dto.password);

    const user = await this.userModel
      .findOneAndUpdate({ _id: id, companyId: new Types.ObjectId(companyId) }, { $set }, { new: true })
      .lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async remove(companyId: string, id: string, currentUserId: string) {
    if (id === currentUserId) throw new BadRequestException('You cannot delete your own account');
    const res = await this.userModel.deleteOne({
      _id: id,
      companyId: new Types.ObjectId(companyId),
    });
    if (res.deletedCount === 0) throw new NotFoundException('User not found');
    return { deleted: true };
  }
}
