import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaymentsService } from './payments.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { DELETE_ROLES, Role, WRITE_ROLES } from '../../common/constants/roles';

class AllocationDto {
  @IsString() documentId: string;
  @Type(() => Number) @IsNumber() @Min(0) amount: number;
}

class CreatePaymentDto {
  @IsIn(['in', 'out']) type: 'in' | 'out';
  @IsString() partyId: string;
  @Type(() => Number) @IsNumber() @Min(0.01) amount: number;
  @IsIn(['cash', 'upi', 'bank', 'cheque', 'credit', 'card']) mode: string;
  @IsDateString() date: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => AllocationDto)
  allocations?: AllocationDto[];
  @IsOptional() @IsBoolean() autoAllocate?: boolean;
  @IsOptional() @IsString() reference?: string;
  @IsOptional() @IsString() note?: string;
}

class PaymentQueryDto extends PaginationQueryDto {
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() partyId?: string;
  @IsOptional() @IsString() mode?: string;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
}

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  list(@CurrentUser('companyId') companyId: string, @Query() query: PaymentQueryDto) {
    return this.paymentsService.list(companyId, query);
  }

  @Get(':id')
  getOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.paymentsService.findOne(companyId, id);
  }

  @Post()
  @Roles(...(WRITE_ROLES as Role[]))
  create(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(companyId, userId, dto);
  }

  @Delete(':id')
  @Roles(...(DELETE_ROLES as Role[]))
  remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.paymentsService.remove(companyId, id);
  }
}
