import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Party, PartyDocument } from './party.schema';
import { BaseCrudService } from '../../common/services/base-crud.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreatePartyDto } from './party.dto';

@Injectable()
export class PartiesService extends BaseCrudService<Party> {
  constructor(@InjectModel(Party.name) private partyModel: Model<PartyDocument>) {
    super(partyModel as unknown as Model<Party>, ['name', 'phone', 'email', 'gstin']);
  }

  async listByType(companyId: string, partyType: 'customer' | 'supplier', query: PaginationQueryDto) {
    return this.findAll(companyId, query, { partyType });
  }

  async createParty(
    companyId: string,
    userId: string,
    partyType: 'customer' | 'supplier',
    dto: CreatePartyDto,
  ) {
    return this.create(companyId, userId, {
      ...dto,
      partyType,
      currentBalance: dto.openingBalance ?? 0,
    } as Partial<Party>);
  }

  /** Adjust the running balance atomically (called from document/payment engine) */
  async adjustBalance(
    companyId: string,
    partyId: string | Types.ObjectId,
    delta: number,
    session?: ClientSession,
  ) {
    await this.partyModel.updateOne(
      { _id: partyId, companyId: new Types.ObjectId(companyId) },
      { $inc: { currentBalance: delta } },
      { session },
    );
  }

  /** Outstanding summary for dashboards */
  async outstandingTotals(companyId: string) {
    const rows = await this.partyModel.aggregate([
      { $match: { companyId: new Types.ObjectId(companyId), deletedAt: null } },
      {
        $group: {
          _id: '$partyType',
          total: { $sum: '$currentBalance' },
          count: { $sum: 1 },
        },
      },
    ]);
    const map: Record<string, { total: number; count: number }> = {};
    for (const r of rows) map[r._id] = { total: r.total, count: r.count };
    return {
      receivable: map.customer?.total ?? 0,
      payable: map.supplier?.total ?? 0,
      customers: map.customer?.count ?? 0,
      suppliers: map.supplier?.count ?? 0,
    };
  }
}
