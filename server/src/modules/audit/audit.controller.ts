import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  list(
    @CurrentUser('companyId') companyId: string,
    @Query() query: PaginationQueryDto & { entity?: string; entityId?: string; action?: string },
  ) {
    return this.audit.list(companyId, query);
  }

  @Get('timeline/:entity/:entityId')
  timeline(
    @CurrentUser('companyId') companyId: string,
    @Param('entity') entity: string,
    @Param('entityId') entityId: string,
  ) {
    return this.audit.timeline(companyId, entity, entityId);
  }
}
