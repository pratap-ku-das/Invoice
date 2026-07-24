import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { InventoryService } from './inventory.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, WRITE_ROLES } from '../../common/constants/roles';

class StockAdjustmentDto {
  @IsString() @IsNotEmpty() productId: string;

  @Type(() => Number) @IsNumber() qty: number; // signed

  @IsIn(['adjust', 'damage', 'transfer', 'in', 'out'])
  type: 'adjust' | 'damage' | 'transfer' | 'in' | 'out';

  @IsOptional() @Type(() => Number) @IsNumber() rate?: number;
  @IsOptional() @IsString() warehouse?: string;
  @IsOptional() @IsString() toWarehouse?: string;
  @IsOptional() @IsString() note?: string;
}

class MovementQueryDto extends PaginationQueryDto {
  @IsOptional() @IsString() productId?: string;
  @IsOptional() @IsString() type?: string;
}

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('movements')
  movements(@CurrentUser('companyId') companyId: string, @Query() query: MovementQueryDto) {
    return this.inventoryService.movements(companyId, query);
  }

  @Get('low-stock')
  lowStock(@CurrentUser('companyId') companyId: string) {
    return this.inventoryService.lowStock(companyId);
  }

  @Get('stock-value')
  stockValue(@CurrentUser('companyId') companyId: string) {
    return this.inventoryService.stockValue(companyId);
  }

  @Post('adjust')
  @Roles(...(WRITE_ROLES as Role[]))
  async adjust(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: StockAdjustmentDto,
  ) {
    // damage always removes stock
    const qty = dto.type === 'damage' ? -Math.abs(dto.qty) : dto.qty;
    await this.inventoryService.applyChanges(
      companyId,
      userId,
      [
        {
          productId: dto.productId,
          qty,
          rate: dto.rate,
          type: dto.type,
          refType: 'manual',
          warehouse: dto.warehouse,
          toWarehouse: dto.toWarehouse,
          note: dto.note,
        },
      ],
      { allowNegative: dto.type === 'adjust' },
    );
    return { applied: true };
  }
}
