import {
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import { User, UserDocument } from '../users/user.schema';
import { Company, CompanyDocument } from '../company/company.schema';
import { LoginDto, RegisterDto } from './auth.dto';
import { env } from '../../config/env';
import { JwtPayload } from './jwt.strategy';
import { Role } from '../../common/constants/roles';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private jwt: JwtService,
  ) {}

  async onModuleInit() {
    try {
      const adminEmail = 'admin@paperbolt.com';
      const existing = await this.userModel.findOne({ email: adminEmail });
      if (!existing) {
        let company = await this.companyModel.findOne({ email: adminEmail });
        if (!company) {
          company = await this.companyModel.create({
            name: 'PaperBolt Platform Administration',
            email: adminEmail,
          });
        }
        await this.userModel.create({
          name: 'System Super Admin',
          email: adminEmail,
          passwordHash: await argon2.hash('Admin@123'),
          role: Role.SUPER_ADMIN,
          companyId: company._id,
        });
      }
    } catch (e) {
      // Ignore initial seed error
    }
  }

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) throw new ConflictException('An account with this email already exists');

    const company = await this.companyModel.create({
      name: dto.companyName,
      gstin: dto.gstin,
      phone: dto.phone,
      email: dto.email,
    });

    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash: await argon2.hash(dto.password),
      role: Role.ADMIN,
      companyId: company._id,
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userModel
      .findOne({ email: dto.email.toLowerCase(), isActive: true })
      .select('+passwordHash');
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) throw new UnauthorizedException('Invalid email or password');

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = this.jwt.verify<JwtPayload>(refreshToken, {
        secret: env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userModel
      .findOne({ _id: payload.sub, isActive: true })
      .select('+refreshTokenHash');
    if (!user?.refreshTokenHash) throw new UnauthorizedException('Session expired');

    const ok = await argon2.verify(user.refreshTokenHash, refreshToken);
    if (!ok) throw new UnauthorizedException('Session expired');

    return this.issueTokens(user);
  }

  async logout(userId: string) {
    await this.userModel.updateOne({ _id: userId }, { $unset: { refreshTokenHash: 1 } });
    return { loggedOut: true };
  }

  async getUserCompanies(userId: string, currentCompanyId: string) {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new UnauthorizedException();

    // Find companies owned by user or where user is registered
    const companies = await this.companyModel
      .find({
        $or: [
          { _id: user.companyId },
          { ownerId: user._id },
          { email: user.email },
        ],
      })
      .lean();

    return companies.map((c) => ({
      id: String(c._id),
      name: c.name,
      gstin: c.gstin,
      plan: c.subscription?.plan || 'free',
      isCurrent: String(c._id) === String(currentCompanyId),
    }));
  }

  async createCompany(userId: string, dto: { name: string; gstin?: string; phone?: string }) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException();

    const company = await this.companyModel.create({
      name: dto.name,
      gstin: dto.gstin,
      phone: dto.phone,
      ownerId: user._id,
      email: user.email,
    });

    user.companyId = company._id as any;
    await user.save();

    return this.issueTokens(user);
  }

  async switchCompany(userId: string, companyId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException();

    const company = await this.companyModel.findById(companyId);
    if (!company) throw new UnauthorizedException('Target company not found');

    user.companyId = company._id as any;
    await user.save();

    return this.issueTokens(user);
  }

  private async issueTokens(user: UserDocument) {
    const payload: JwtPayload = {
      sub: String(user._id),
      companyId: String(user.companyId),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = this.jwt.sign(payload, {
      secret: env.JWT_ACCESS_SECRET,
      expiresIn: env.JWT_ACCESS_TTL,
    });
    const refreshToken = this.jwt.sign(payload, {
      secret: env.JWT_REFRESH_SECRET,
      expiresIn: env.JWT_REFRESH_TTL,
    });

    await this.userModel.updateOne(
      { _id: user._id },
      { refreshTokenHash: await argon2.hash(refreshToken) },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: String(user.companyId),
      },
    };
  }
}
