import { IsString, IsOptional } from 'class-validator';

export class PciAuditArchiveQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  sort?: string;

  @IsString()
  @IsOptional()
  order?: 'ASC' | 'DESC';
}
