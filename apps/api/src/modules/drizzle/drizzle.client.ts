// drizzle.client.ts

import { Injectable, Inject, Module, Controller, Get, CanActivate, ExecutionContext, createParamDecorator, SetMetadata } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt'; // Example strategy, replace if needed
import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';
import { pgTable, serial, varchar, integer, timestamp } from 'drizzle-orm/pg-core'; // Example Drizzle ORM driver

// DTO
export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

// Service
@Injectable()
export class DrizzleClient {
  constructor(@Inject('DATABASE') private db: any) {} // 'any' for minimal example, replace with actual DrizzleClient type
  
  async getData(): Promise<string> {
    // Simulate database interaction
    await new Promise(resolve => setTimeout(resolve, 100));
    return `Data from DrizzleClient using ${(this.db as any).name}`;
  }
}

// Controller
@Controller('drizzle')
export class DrizzleController {
  constructor(private readonly drizzleClient: DrizzleClient) {}

  @Get()
  async getHello(): Promise<string> {
    return this.drizzleClient.getData();
  }
}

// Module
@Module({
  providers: [
    {
      provide: 'DATABASE',
      useValue: { name: 'Drizzle Database Connection' }, // Minimal mock database connection
    },
    DrizzleClient,
  ],
  controllers: [DrizzleController],
  exports: [DrizzleClient],
})
export class DrizzleModule {}

// Guard
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true; // Always allow for minimal example
  }
}

// Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: (req: any) => req.headers.authorization,
      ignoreExpiration: false,
      secretOrKey: 'superSecretKey', // Minimal secret, replace in real app
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}

// Decorator (Param Decorator)
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Assumes request.user is set by authentication
  },
);

// Decorator (Method Decorator)
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Interface
export interface Item {
  id: number;
  name: string;
  quantity: number;
}

// Enum
export enum ItemStatus {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending',
}

// Schema (Drizzle table definition)
export const items = pgTable('items', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  quantity: integer('quantity').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

