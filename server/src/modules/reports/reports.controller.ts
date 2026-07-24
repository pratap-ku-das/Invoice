import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GstService } from './gst.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface RangeQuery {
  from?: string;
  to?: string;
}

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly gstService: GstService,
  ) {}

  @Get('sales')
  sales(@CurrentUser('companyId') companyId: string, @Query() q: RangeQuery) {
    return this.reportsService.salesReport(companyId, q);
  }

  @Get('purchase')
  purchase(@CurrentUser('companyId') companyId: string, @Query() q: RangeQuery) {
    return this.reportsService.purchaseReport(companyId, q);
  }

  @Get('profit')
  profit(@CurrentUser('companyId') companyId: string, @Query() q: RangeQuery) {
    return this.reportsService.profitReport(companyId, q);
  }

  @Get('sales-series')
  salesSeries(
    @CurrentUser('companyId') companyId: string,
    @Query() q: RangeQuery & { granularity?: 'day' | 'month' | 'year' },
  ) {
    return this.reportsService.salesSeries(companyId, q, q.granularity ?? 'month');
  }

  @Get('top-customers')
  topCustomers(@CurrentUser('companyId') companyId: string, @Query() q: RangeQuery & { limit?: string }) {
    return this.reportsService.topCustomers(companyId, q, q.limit ? Number(q.limit) : 10);
  }

  @Get('ledger/:partyId')
  ledger(
    @CurrentUser('companyId') companyId: string,
    @Param('partyId') partyId: string,
    @Query() q: RangeQuery,
  ) {
    return this.reportsService.partyLedger(companyId, partyId, q);
  }

  // ---- GST ----
  @Get('gst/summary')
  gstSummary(@CurrentUser('companyId') companyId: string, @Query() q: RangeQuery) {
    return this.gstService.summary(companyId, q);
  }

  @Get('gst/hsn')
  hsnSummary(@CurrentUser('companyId') companyId: string, @Query() q: RangeQuery) {
    return this.gstService.hsnSummary(companyId, q);
  }

  @Get('gst/gstr1')
  gstr1(@CurrentUser('companyId') companyId: string, @Query() q: RangeQuery) {
    return this.gstService.gstr1(companyId, q);
  }
}
