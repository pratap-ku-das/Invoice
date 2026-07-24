import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { NumberSequenceService } from './number-sequence.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, SETTINGS_ROLES } from '../../common/constants/roles';

@ApiTags('company')
@ApiBearerAuth()
@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly seqService: NumberSequenceService,
  ) {}

  @Get()
  get(@CurrentUser('companyId') companyId: string) {
    return this.companyService.get(companyId);
  }

  @Get('onboarding-status')
  getOnboardingStatus(@CurrentUser('companyId') companyId: string) {
    return this.companyService.getOnboardingStatus(companyId);
  }

  @Post('onboarding')
  saveOnboardingData(@CurrentUser('companyId') companyId: string, @Body() dto: Record<string, any>) {
    return this.companyService.saveOnboardingData(companyId, dto);
  }

  @Patch()
  @Roles(...(SETTINGS_ROLES as Role[]))
  update(@CurrentUser('companyId') companyId: string, @Body() dto: Record<string, unknown>) {
    return this.companyService.update(companyId, dto);
  }

  @Get('sequences')
  sequences(@CurrentUser('companyId') companyId: string) {
    return this.seqService.listSettings(companyId);
  }

  @Patch('sequences/:docType')
  @Roles(...(SETTINGS_ROLES as Role[]))
  updateSequence(
    @CurrentUser('companyId') companyId: string,
    @Param('docType') docType: string,
    @Body() dto: { prefix?: string; nextNumber?: number; padding?: number },
  ) {
    return this.seqService.updateSettings(companyId, docType, dto);
  }
}
