import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CategoriesService, ProductsService, UnitsService } from './catalog.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { DELETE_ROLES, Role, WRITE_ROLES } from '../../common/constants/roles';

class ProductListQueryDto extends PaginationQueryDto {
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() lowStock?: string;
  @IsOptional() @IsString() itemType?: string;
}

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(@CurrentUser('companyId') companyId: string, @Query() query: ProductListQueryDto) {
    return this.productsService.listProducts(companyId, query);
  }

  @Get('by-code/:code')
  byCode(@CurrentUser('companyId') companyId: string, @Param('code') code: string) {
    return this.productsService.findByCode(companyId, code);
  }

  @Get('generate-sku')
  generateSku(@CurrentUser('companyId') companyId: string, @Query('name') name: string) {
    return this.productsService.generateSku(companyId, name ?? '').then((sku) => ({ sku }));
  }

  @Get(':id')
  getOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.productsService.findOne(companyId, id);
  }

  @Post()
  @Roles(...(WRITE_ROLES as Role[]))
  create(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.productsService.createProduct(companyId, userId, dto);
  }

  @Patch(':id')
  @Roles(...(WRITE_ROLES as Role[]))
  update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    // stock.current is only mutable via inventory movements
    if (dto.stock && typeof dto.stock === 'object') {
      delete (dto.stock as Record<string, unknown>).current;
    }
    return this.productsService.update(companyId, id, { $set: dto });
  }

  @Delete(':id')
  @Roles(...(DELETE_ROLES as Role[]))
  remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.productsService.softDelete(companyId, id);
  }
}

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  list(@CurrentUser('companyId') companyId: string, @Query() query: PaginationQueryDto) {
    return this.categoriesService.findAll(companyId, query);
  }

  @Post()
  @Roles(...(WRITE_ROLES as Role[]))
  create(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.categoriesService.create(companyId, userId, dto);
  }

  @Patch(':id')
  @Roles(...(WRITE_ROLES as Role[]))
  update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.categoriesService.update(companyId, id, { $set: dto });
  }

  @Delete(':id')
  @Roles(...(DELETE_ROLES as Role[]))
  remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.categoriesService.softDelete(companyId, id);
  }
}

@ApiTags('units')
@ApiBearerAuth()
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  async list(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    await this.unitsService.seedDefaults(companyId, userId);
    return this.unitsService.findAll(companyId, { ...query, limit: query.limit ?? 100 });
  }

  @Post()
  @Roles(...(WRITE_ROLES as Role[]))
  create(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.unitsService.create(companyId, userId, dto);
  }

  @Patch(':id')
  @Roles(...(WRITE_ROLES as Role[]))
  update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.unitsService.update(companyId, id, { $set: dto });
  }

  @Delete(':id')
  @Roles(...(DELETE_ROLES as Role[]))
  remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.unitsService.softDelete(companyId, id);
  }
}
