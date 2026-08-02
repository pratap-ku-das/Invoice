import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SupportService, CreateTicketDto } from './support.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  createTicket(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateTicketDto,
  ) {
    return this.supportService.createTicket(companyId, userId, dto);
  }

  @Get('my-tickets')
  getMyTickets(@CurrentUser('companyId') companyId: string) {
    return this.supportService.getCompanyTickets(companyId);
  }

  @Get('admin/tickets')
  getAllAdminTickets() {
    return this.supportService.getAllTicketsForAdmin();
  }

  @Patch('admin/tickets/:id/status')
  updateTicketStatus(
    @Param('id') id: string,
    @Body() dto: { status: string; adminResponse?: string },
  ) {
    return this.supportService.updateTicketStatus(id, dto.status, dto.adminResponse);
  }
}
