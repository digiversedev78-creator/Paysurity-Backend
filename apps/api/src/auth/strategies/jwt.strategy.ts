import { Injectable } from '@nestjs/common';
import { SecretsService } from '../modules/secrets/secrets.service';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategyStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private secretsService: SecretsService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-fallback-secret',
    });
  }

  async validate(payload: any): Promise<any> {
    return payload;
  }
}
