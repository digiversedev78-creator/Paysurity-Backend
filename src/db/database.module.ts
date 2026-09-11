import { Module } from '@nestjs/common';

/**
 * Minimal stub for the DatabaseModule used in tests.
 * Provides the 'DATABASE' provider token expected by service constructors.
 * In production the real DatabaseModule is imported elsewhere.
 */
@Module({
  providers: [],
  exports: [],
})
export class DatabaseModule {}
