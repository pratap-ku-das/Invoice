import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from './company.schema';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  ) {}

  async get(companyId: string) {
    const company = await this.companyModel.findById(companyId).lean();
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async update(companyId: string, dto: Partial<Company>) {
    const company = await this.companyModel
      .findByIdAndUpdate(companyId, { $set: dto }, { new: true })
      .lean();
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async saveOnboardingData(companyId: string, dto: Record<string, any>) {
    const { isCompleted, onboardingStep, ...fields } = dto;
    const updateData: Record<string, any> = { ...fields };

    if (onboardingStep !== undefined) updateData.onboardingStep = onboardingStep;
    if (isCompleted) updateData.isOnboardingCompleted = true;

    const company = await this.companyModel
      .findByIdAndUpdate(companyId, { $set: updateData }, { new: true })
      .lean();

    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async getOnboardingStatus(companyId: string) {
    const company = await this.companyModel
      .findById(companyId)
      .select('name displayName isOnboardingCompleted onboardingStep businessType industry gstin pan hasGst logo address bank printSettings')
      .lean();

    if (!company) throw new NotFoundException('Company not found');
    return company;
  }
}
