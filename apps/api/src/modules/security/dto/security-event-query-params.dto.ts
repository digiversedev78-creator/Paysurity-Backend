import { IsOptional, IsString } from 'class-validator';

export class SecurityEventQueryParamsDto {
  @IsOptional()
  @IsString()
  readonly type?: string;

  @IsOptional()
  @IsString()
  readonly userId?: string;
}
