import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { env } from '../../config/env';
import { AuthUser } from '../../common/decorators/current-user.decorator';

export interface JwtPayload {
  sub: string;
  companyId: string;
  email: string;
  role: string;
  name: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('token'),
      ]),
      ignoreExpiration: false,
      secretOrKey: env.JWT_ACCESS_SECRET,
    });
  }

  validate(payload: JwtPayload): AuthUser {
    return {
      userId: payload.sub,
      companyId: payload.companyId,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
  }
}
