import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles';

class CreateUserDto {
  @IsString() @IsNotEmpty() name: string;
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
  @IsEnum(Role) role: Role;
}

class UpdateUserDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEnum(Role) role?: Role;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() @MinLength(8) password?: string;
}

@ApiTags('users')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(@CurrentUser('companyId') companyId: string) {
    return this.usersService.list(companyId);
  }

  @Post()
  create(@CurrentUser('companyId') companyId: string, @Body() dto: CreateUserDto) {
    return this.usersService.create(companyId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(companyId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.usersService.remove(companyId, id, userId);
  }
}
