import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto, RegisterDto } from './auth.dto';
import { Public } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Get('companies')
  getUserCompanies(
    @CurrentUser('userId') userId: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.authService.getUserCompanies(userId, companyId);
  }

  @Post('companies')
  createCompany(
    @CurrentUser('userId') userId: string,
    @Body() dto: { name: string; gstin?: string; phone?: string },
  ) {
    return this.authService.createCompany(userId, dto);
  }

  @Post('switch-company')
  switchCompany(
    @CurrentUser('userId') userId: string,
    @Body() dto: { companyId: string },
  ) {
    return this.authService.switchCompany(userId, dto.companyId);
  }

  @Post('logout')
  logout(@CurrentUser('userId') userId: string) {
    return this.authService.logout(userId);
  }
}
