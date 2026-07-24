import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { AddressDto } from '../parties/party.dto';

export class DocumentItemDto {
  @IsOptional() @IsString() productId?: string;
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() hsn?: string;

  @Type(() => Number) @IsNumber() @Min(0.0001) qty: number;

  @IsOptional() @IsString() unitId?: string;
  @IsOptional() @IsString() unitName?: string;

  @Type(() => Number) @IsNumber() @Min(0) price: number;

  @IsOptional() @IsBoolean() taxInclusive?: boolean;
  @IsOptional() @IsIn(['percent', 'flat']) discountType?: 'percent' | 'flat';
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) discountValue?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) taxRate?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) cessRate?: number;
}

export class PaymentSplitDto {
  @IsIn(['cash', 'upi', 'bank', 'cheque', 'credit', 'card'])
  mode: string;

  @Type(() => Number) @IsNumber() @Min(0)
  amount: number;

  @IsOptional() @IsString() reference?: string;
}

export class CreateDocumentDto {
  @IsOptional() @IsString() number?: string; // omit → auto
  @IsDateString() date: string;
  @IsOptional() @IsDateString() dueDate?: string;

  @IsOptional() @IsString() partyId?: string;
  @IsOptional() @IsString() partyName?: string;
  @IsOptional() @IsString() partyPhone?: string;
  @IsOptional() @IsString() partyEmail?: string;
  @IsOptional() @IsString() partyGstin?: string;

  @IsOptional() @ValidateNested() @Type(() => AddressDto) billingAddress?: AddressDto;
  @IsOptional() @ValidateNested() @Type(() => AddressDto) shippingAddress?: AddressDto;

  @IsOptional() @IsString() referenceNumber?: string;
  @IsOptional() @IsString() salesPerson?: string;
  @IsOptional() @IsString() paymentTerms?: string;

  @IsArray() @ValidateNested({ each: true }) @Type(() => DocumentItemDto)
  items: DocumentItemDto[];

  @IsOptional() @IsIn(['percent', 'flat']) docDiscountType?: 'percent' | 'flat';
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) docDiscountValue?: number;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) shippingCharge?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) packingCharge?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) otherCharge?: number;

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => PaymentSplitDto)
  payments?: PaymentSplitDto[];

  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() terms?: string;

  @IsOptional() @IsBoolean() isDraft?: boolean;

  @IsOptional() @IsObject() extra?: Record<string, unknown>;

  @IsOptional() @IsString() againstDocId?: string;
}

export class DocumentListQueryDto extends PaginationQueryDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() partyId?: string;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
}
