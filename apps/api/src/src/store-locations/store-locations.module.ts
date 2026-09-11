// DTO
export class CreateStoreLocationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;
}

// Service
@Injectable()
export class StoreLocationsService {
  constructor(@Inject('DATABASE') private db: any) {} // Example injection

  findAll(): string[] {
    return ['Location A', 'Location B'];
  }
}

// Controller
@Controller('store-locations')
export class StoreLocationsController {
  constructor(private readonly storeLocationsService: StoreLocationsService) {}

  @Get()
  findAll(): string[] {
    return this.storeLocationsService.findAll();
  }
}

// Module
@Module({
  providers: [StoreLocationsService],
  controllers: [StoreLocationsController],
  exports: [StoreLocationsService] // Export service if other modules need it
})
export class StoreLocationsModule {}

// Guard
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return true; // Always allow for minimalism
  }
}

// Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'superSecretKey', // Example
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}

// Decorator
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Interface
export interface StoreLocation {
  id: number;
  name: string;
  address?: string;
}

// Enum
export enum StoreLocationType {
  Retail = 'retail',
  Warehouse = 'warehouse',
  Office = 'office',
}

// Schema (Drizzle)
export const storeLocations = pgTable('store_locations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  address: varchar('address', { length: 512 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Required imports for the above definitions
import { Injectable, Inject, Module, Controller, Get, CanActivate, ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Observable } from 'rxjs';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';
