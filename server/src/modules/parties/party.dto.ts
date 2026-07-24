import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class AddressDto {
  @IsOptional() @IsString() line1?: string;
  @IsOptional() @IsString() line2?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() stateCode?: string;
  @IsOptional() @IsString() pincode?: string;
  @IsOptional() @IsString() country?: string;
}

export class CreatePartyDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() whatsapp?: string;
  @IsOptional() @IsString() gstin?: string;
  @IsOptional() @IsString() pan?: string;

  @IsOptional() @ValidateNested() @Type(() => AddressDto)
  billingAddress?: AddressDto;

  @IsOptional() @ValidateNested() @Type(() => AddressDto)
  shippingAddress?: AddressDto;

  @IsOptional() @IsNumber() creditLimit?: number;
  @IsOptional() @IsNumber() creditDays?: number;
  @IsOptional() @IsNumber() openingBalance?: number;
  @IsOptional() @IsString() notes?: string;
}

export class UpdatePartyDto extends CreatePartyDto {
  @IsOptional() @IsString() declare name: string;
}
