import { SetMetadata } from '@nestjs/common';

export const REQUIRE_ROLE_KEY = 'require_role';
export const RequireRole = (...roles: string[]) => SetMetadata(REQUIRE_ROLE_KEY, roles);
