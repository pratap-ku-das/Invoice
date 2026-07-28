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

import { Payment, PaymentDocument } from '../payments/payment.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(BusinessDocument.name) private docModel: Model<BusinessDocumentDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
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

  async getUsers(query: { search?: string; role?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }
    if (query.role) {
      filter.role = query.role;
    }

    const [users, total] = await Promise.all([
      this.userModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.userModel.countDocuments(filter),
    ]);

    const companyIds = users.map((u) => u.companyId).filter(Boolean);
    const companies = await this.companyModel.find({ _id: { $in: companyIds } }).select('name').lean();
    const companyMap = new Map(companies.map((c) => [String(c._id), c.name]));

    const data = users.map((u) => ({
      id: String(u._id),
      _id: String(u._id),
      name: u.name,
      email: u.email,
      phone: (u as any).phone || 'N/A',
      role: u.role,
      companyId: u.companyId ? String(u.companyId) : null,
      companyName: u.companyId ? companyMap.get(String(u.companyId)) || 'Unassigned' : 'Platform System',
      createdAt: (u as any).createdAt ? new Date((u as any).createdAt).toLocaleString() : new Date().toLocaleString(),
      isActive: u.isActive !== false,
    }));

    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async getPayments(query: { search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const [companies, total] = await Promise.all([
      this.companyModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.companyModel.countDocuments(filter),
    ]);

    const planPrices: Record<string, number> = {
      starter: 299,
      free: 299,
      basic: 499,
      pro: 999,
    };

    // Calculate total MRR from active company subscriptions
    const allCompanies = await this.companyModel.find().lean();
    let totalSaasRevenue = 0;
    let paidSubscriptionsCount = 0;

    allCompanies.forEach((c) => {
      const plan = c.subscription?.plan || 'free';
      const price = planPrices[plan] || 0;
      if (price > 0 && c.subscription?.status !== 'cancelled') {
        totalSaasRevenue += price;
        paidSubscriptionsCount++;
      }
    });

    const data = companies.map((c) => {
      const plan = c.subscription?.plan || 'free';
      const price = planPrices[plan] || 0;
      const status = c.subscription?.status || 'active';
      const expiresAt = c.subscription?.expiresAt
        ? new Date(c.subscription.expiresAt).toISOString().split('T')[0]
        : 'Lifetime / Monthly';

      return {
        id: String(c._id),
        companyName: c.name,
        companyEmail: c.email || 'N/A',
        plan: plan.toUpperCase() + ' PLAN',
        planPrice: price,
        amountFormatted: `₹${price}`,
        status,
        expiresAt,
        date: (c as any).createdAt ? new Date((c as any).createdAt).toISOString().split('T')[0] : '2026-07-25',
      };
    });

    return {
      totalSaasRevenue,
      paidSubscriptionsCount,
      totalCompaniesCount: allCompanies.length,
      data,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async getAuditLogs() {
    const [recentCompanies, recentUsers, recentDocs] = await Promise.all([
      this.companyModel.find().sort({ createdAt: -1 }).limit(10).lean(),
      this.userModel.find().sort({ createdAt: -1 }).limit(10).lean(),
      this.docModel.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    const logs: Array<{ id: string; action: string; user: string; target: string; ip: string; date: string }> = [];

    recentCompanies.forEach((c, idx) => {
      logs.push({
        id: `LOG-${9000 + idx}`,
        action: 'Company Account Created',
        user: c.email || 'Admin',
        target: c.name,
        ip: '127.0.0.1',
        date: (c as any).createdAt ? new Date((c as any).createdAt).toLocaleString() : new Date().toLocaleString(),
      });
    });

    recentUsers.forEach((u, idx) => {
      logs.push({
        id: `LOG-${8000 + idx}`,
        action: `User Registered (${u.role})`,
        user: u.email,
        target: u.name,
        ip: '127.0.0.1',
        date: (u as any).createdAt ? new Date((u as any).createdAt).toLocaleString() : new Date().toLocaleString(),
      });
    });

    recentDocs.forEach((d, idx) => {
      logs.push({
        id: `LOG-${7000 + idx}`,
        action: `Document Created (${d.docType.toUpperCase()}) #${d.number}`,
        user: d.partyName || 'Staff User',
        target: `Total ₹${d.grandTotal}`,
        ip: '127.0.0.1',
        date: (d as any).createdAt ? new Date((d as any).createdAt).toLocaleString() : new Date().toLocaleString(),
      });
    });

    logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return logs.slice(0, 30);
  }

  async getAnalytics() {
    const [stats, docBreakdown, companyGrowth] = await Promise.all([
      this.getStats(),
      this.docModel.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: '$docType', count: { $sum: 1 }, totalValue: { $sum: '$grandTotal' } } },
      ]),
      this.companyModel.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return {
      ...stats,
      docBreakdown,
      companyGrowth,
    };
  }
}
