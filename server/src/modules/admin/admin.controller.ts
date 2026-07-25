import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { PlanId } from '../../common/constants/plans';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, PLATFORM_ROLES } from '../../common/constants/roles';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(...(PLATFORM_ROLES as Role[]))
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('companies')
  getCompanies(
    @Query('search') search?: string,
    @Query('plan') plan?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getCompanies({ search, plan, status, page, limit });
  }

  @Post('companies/:id/impersonate')
  impersonateCompany(
    @CurrentUser('userId') userId: string,
    @Param('id') companyId: string,
  ) {
    return this.adminService.impersonateCompany(userId, companyId);
  }

  @Patch('companies/:id')
  updateCompanySubscription(
    @Param('id') id: string,
    @Body() dto: { plan?: PlanId; status?: string; expiresAt?: Date | null },
  ) {
    return this.adminService.updateCompanySubscription(id, dto);
  }

  @Get('users')
  getUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getUsers({ search, role, page, limit });
  }

  @Get('payments')
  getPayments(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getPayments({ search, page, limit });
  }

  @Get('audit-logs')
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }

  @Get('analytics')
  getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Delete('companies/:id')
  deleteCompany(@Param('id') id: string) {
    return this.adminService.deleteCompany(id);
  }
}
