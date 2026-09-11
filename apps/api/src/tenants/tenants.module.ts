import { Module, Injectable, Controller, Get, CanActivate, ExecutionContext, createParamDecorator, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { IsString, IsNotEmpty } from 'class-validator';
import { PassportModule } from '@nestjs/passport';
import { tenants } from '@paysurity/database';

// Interface
export interface ITenant {
  id: string;
  name: string;
  isActive: boolean;
}

// Enum
export enum TenantStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
}

// DTO
export class TenantDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

// Service
@Injectable()
export class TenantsService {
  constructor(@Inject('DATABASE') private db: any) {}

  async getTenants(): Promise<ITenant[]> {
    const result = await this.db.select().from(tenants);
    return result.map((t: any) => ({
      id: t.id,
      name: t.name,
      isActive: t.status === 'active',
    }));
  }
}

// Guard
@Injectable()
export class TenantsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}

// Strategy
@Injectable()
export class TenantsStrategy extends PassportStrategy(Strategy, 'tenant-local') {
  constructor() {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string): Promise<any> {
    if (username === 'admin' && password === 'password') {
      return { userId: 1, username: 'admin' };
    }
    return null;
  }
}

// Decorator
export const UserAgent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['user-agent'];
  },
);

// Controller
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  async getTenants(@UserAgent() userAgent: string): Promise<ITenant[]> {
    console.log(`User-Agent: ${userAgent}`);
    return this.tenantsService.getTenants();
  }
}

// Module
@Module({
  imports: [PassportModule.register({ defaultStrategy: 'tenant-local' })],
  providers: [
    TenantsService,
    TenantsGuard,
    TenantsStrategy,
  ],
  controllers: [TenantsController],
  exports: [TenantsService],
})
export class TenantsModule {}
