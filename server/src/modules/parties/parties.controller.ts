import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PartiesService } from './parties.service';
import { CreatePartyDto, UpdatePartyDto } from './party.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { DELETE_ROLES, Role, WRITE_ROLES } from '../../common/constants/roles';

@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private readonly partiesService: PartiesService) {}

  @Get()
  list(@CurrentUser('companyId') companyId: string, @Query() query: PaginationQueryDto) {
    return this.partiesService.listByType(companyId, 'customer', query);
  }

  @Get(':id')
  getOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.partiesService.findOne(companyId, id);
  }

  @Post()
  @Roles(...(WRITE_ROLES as Role[]))
  create(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreatePartyDto,
  ) {
    return this.partiesService.createParty(companyId, userId, 'customer', dto);
  }

  @Patch(':id')
  @Roles(...(WRITE_ROLES as Role[]))
  update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePartyDto,
  ) {
    return this.partiesService.update(companyId, id, { $set: dto });
  }

  @Delete(':id')
  @Roles(...(DELETE_ROLES as Role[]))
  remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.partiesService.softDelete(companyId, id);
  }
}

@ApiTags('suppliers')
@ApiBearerAuth()
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly partiesService: PartiesService) {}

  @Get()
  list(@CurrentUser('companyId') companyId: string, @Query() query: PaginationQueryDto) {
    return this.partiesService.listByType(companyId, 'supplier', query);
  }

  @Get(':id')
  getOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.partiesService.findOne(companyId, id);
  }

  @Post()
  @Roles(...(WRITE_ROLES as Role[]))
  create(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreatePartyDto,
  ) {
    return this.partiesService.createParty(companyId, userId, 'supplier', dto);
  }

  @Patch(':id')
  @Roles(...(WRITE_ROLES as Role[]))
  update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePartyDto,
  ) {
    return this.partiesService.update(companyId, id, { $set: dto });
  }

  @Delete(':id')
  @Roles(...(DELETE_ROLES as Role[]))
  remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.partiesService.softDelete(companyId, id);
  }
}
