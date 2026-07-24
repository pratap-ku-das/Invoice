import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  summary(@CurrentUser('companyId') companyId: string) {
    return this.dashboardService.summary(companyId);
  }

  @Get('sales-overview')
  salesOverview(@CurrentUser('companyId') companyId: string, @Query('months') months?: string) {
    return this.dashboardService.salesOverview(companyId, months ? Number(months) : 12);
  }

  @Get('top-products')
  topProducts(@CurrentUser('companyId') companyId: string, @Query('limit') limit?: string) {
    return this.dashboardService.topProducts(companyId, limit ? Number(limit) : 5);
  }

  @Get('payment-status')
  paymentStatus(@CurrentUser('companyId') companyId: string) {
    return this.dashboardService.paymentStatus(companyId);
  }

  @Get('recent')
  recent(@CurrentUser('companyId') companyId: string) {
    return this.dashboardService.recent(companyId);
  }
}
