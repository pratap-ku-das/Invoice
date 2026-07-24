import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ExpenseCategoriesService, ExpensesService } from './expenses.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { DELETE_ROLES, Role, WRITE_ROLES } from '../../common/constants/roles';

class ExpenseQueryDto extends PaginationQueryDto {
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() from?: string;
  @IsOptional() @IsString() to?: string;
}

@ApiTags('expense-categories')
@ApiBearerAuth()
@Controller('expense-categories')
export class ExpenseCategoriesController {
  constructor(private readonly service: ExpenseCategoriesService) {}

  @Get()
  list(@CurrentUser('companyId') companyId: string, @Query() query: PaginationQueryDto) {
    return this.service.findAll(companyId, { ...query, limit: query.limit ?? 100 });
  }

  @Post()
  @Roles(...(WRITE_ROLES as Role[]))
  create(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.service.create(companyId, userId, dto);
  }

  @Patch(':id')
  @Roles(...(WRITE_ROLES as Role[]))
  update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.service.update(companyId, id, { $set: dto });
  }

  @Delete(':id')
  @Roles(...(DELETE_ROLES as Role[]))
  remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.service.softDelete(companyId, id);
  }
}

@ApiTags('expenses')
@ApiBearerAuth()
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly service: ExpensesService) {}

  @Get()
  list(@CurrentUser('companyId') companyId: string, @Query() query: ExpenseQueryDto) {
    return this.service.list(companyId, query);
  }

  @Post()
  @Roles(...(WRITE_ROLES as Role[]))
  create(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.service.create(companyId, userId, dto);
  }

  @Patch(':id')
  @Roles(...(WRITE_ROLES as Role[]))
  update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.service.update(companyId, id, dto);
  }

  @Delete(':id')
  @Roles(...(DELETE_ROLES as Role[]))
  remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.service.remove(companyId, id);
  }
}
