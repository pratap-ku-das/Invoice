import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SupportTicket, SupportTicketDocument } from './support-ticket.schema';
import { Company, CompanyDocument } from '../company/company.schema';
import { User, UserDocument } from '../users/user.schema';

export interface CreateTicketDto {
  subject: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  message: string;
}

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(SupportTicket.name) private ticketModel: Model<SupportTicketDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createTicket(companyId: string, userId: string, dto: CreateTicketDto) {
    const company = await this.companyModel.findById(companyId).lean();
    const user = await this.userModel.findById(userId).lean();

    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;

    const ticket = await this.ticketModel.create({
      ticketId,
      companyId: new Types.ObjectId(companyId),
      companyName: company?.name || company?.displayName || 'Registered Company',
      subject: dto.subject,
      category: dto.category || 'General Query',
      priority: dto.priority || 'medium',
      status: 'open',
      message: dto.message,
      createdBy: new Types.ObjectId(userId),
      createdByName: user?.name || 'Company User',
    });

    return ticket;
  }

  async getCompanyTickets(companyId: string) {
    return this.ticketModel
      .find({ companyId: new Types.ObjectId(companyId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  async getAllTicketsForAdmin() {
    return this.ticketModel.find().sort({ createdAt: -1 }).limit(200).lean();
  }

  async updateTicketStatus(id: string, status: string, adminResponse?: string) {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) throw new NotFoundException('Support ticket not found');

    if (status) ticket.status = status as any;
    if (adminResponse !== undefined) ticket.adminResponse = adminResponse;

    await ticket.save();
    return ticket;
  }
}
