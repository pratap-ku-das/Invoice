import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model, Types } from 'mongoose';
import { Company, CompanyDocument } from '../company/company.schema';
import { User, UserDocument } from '../users/user.schema';
import { BusinessDocument, BusinessDocumentDocument } from '../documents/document.schema';
import { PlanId } from '../../common/constants/plans';
import { env } from '../../config/env';
import { Role } from '../../common/constants/roles';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(BusinessDocument.name) private docModel: Model<BusinessDocumentDocument>,
    private jwt: JwtService,
  ) {}

  async getStats() {
    const [totalCompanies, totalUsers, totalDocuments, planBreakdown] = await Promise.all([
      this.companyModel.countDocuments(),
      this.userModel.countDocuments(),
      this.docModel.countDocuments({ deletedAt: null }),
      this.companyModel.aggregate([
        {
          $group: {
            _id: '$subscription.plan',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const plansCount: Record<string, number> = { free: 0, basic: 0, pro: 0 };
    for (const p of planBreakdown) {
      if (p._id) plansCount[p._id] = p.count;
    }

    return {
      totalCompanies,
      totalUsers,
      totalDocuments,
      plansCount,
    };
  }

  async getCompanies(query: { search?: string; plan?: string; status?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }, { gstin: regex }];
    }

    if (query.plan) {
      filter['subscription.plan'] = query.plan;
    }

    if (query.status) {
      filter['subscription.status'] = query.status;
    }

    const [companies, total] = await Promise.all([
      this.companyModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.companyModel.countDocuments(filter),
    ]);

    // Attach owner info, user count, and doc count for each company
    const enrichedCompanies = await Promise.all(
      companies.map(async (comp) => {
        const [usersCount, docsCount, owner] = await Promise.all([
          this.userModel.countDocuments({ companyId: comp._id }),
          this.docModel.countDocuments({ companyId: comp._id, deletedAt: null }),
          comp.ownerId
            ? this.userModel.findById(comp.ownerId).select('name email phone').lean()
            : this.userModel.findOne({ companyId: comp._id }).select('name email phone').lean(),
        ]);

        return {
          ...comp,
          id: String(comp._id),
          subscription: comp.subscription || { plan: 'free', status: 'active' },
          usersCount,
          docsCount,
          owner: owner ? { name: owner.name, email: owner.email } : null,
        };
      }),
    );

    return {
      data: enrichedCompanies,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateCompanySubscription(
    companyId: string,
    dto: { plan?: PlanId; status?: string; expiresAt?: Date | null },
  ) {
    const company = await this.companyModel.findById(companyId);
    if (!company) throw new NotFoundException('Company not found');

    if (dto.plan) company.subscription.plan = dto.plan;
    if (dto.status) company.subscription.status = dto.status;
    if (dto.expiresAt !== undefined) company.subscription.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : undefined;

    await company.save();
    return company;
  }

  async deleteCompany(companyId: string) {
    const company = await this.companyModel.findById(companyId);
    if (!company) throw new NotFoundException('Company not found');

    await Promise.all([
      this.companyModel.deleteOne({ _id: companyId }),
      this.userModel.deleteMany({ companyId: new Types.ObjectId(companyId) }),
      this.docModel.deleteMany({ companyId: new Types.ObjectId(companyId) }),
    ]);

    return { deleted: true, companyId };
  }

  async impersonateCompany(adminUserId: string, companyId: string) {
    const company = await this.companyModel.findById(companyId);
    if (!company) throw new NotFoundException('Company not found');

    const adminUser = await this.userModel.findById(adminUserId);
    if (!adminUser) throw new NotFoundException('Platform Owner user not found');

    const payload = {
      sub: String(adminUser._id),
      companyId: String(company._id),
      email: adminUser.email,
      role: Role.PLATFORM_OWNER,
      name: `${adminUser.name} (Impersonating ${company.name})`,
    };

    const accessToken = this.jwt.sign(payload, {
      secret: env.JWT_ACCESS_SECRET,
      expiresIn: env.JWT_ACCESS_TTL,
    });
    const refreshToken = this.jwt.sign(payload, {
      secret: env.JWT_REFRESH_SECRET,
      expiresIn: env.JWT_REFRESH_TTL,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: String(adminUser._id),
        name: payload.name,
        email: adminUser.email,
        role: Role.PLATFORM_OWNER,
        companyId: String(company._id),
      },
    };
  }
}
