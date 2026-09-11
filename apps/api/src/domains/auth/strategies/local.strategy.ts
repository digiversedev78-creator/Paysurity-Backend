// local.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategyStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, pass: string): Promise<any> {
    // This is a minimal implementation.
    // In a real application, you would validate credentials against a database.
    if (email === 'test@example.com' && pass === 'password') {
      return { userId: 1, email: 'test@example.com' };
    }
    throw new UnauthorizedException();
  }
}
