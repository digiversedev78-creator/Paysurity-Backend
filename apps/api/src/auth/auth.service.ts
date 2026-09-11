import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  login(userDto: any) {
    // Hardcoded mock user for Phase 9. Phase 10 will wire this to PostgreSQL.
    if (userDto.email === 'admin@paysurity.com' && userDto.password === 'admin123') {
      const payload = { sub: 1, email: userDto.email, role: 'admin' };
      const secret = process.env.JWT_SECRET || 'temp_dev_secret_123!!';
      const token = jwt.sign(payload, secret, { expiresIn: '1h' });
      return { access_token: token };
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}
