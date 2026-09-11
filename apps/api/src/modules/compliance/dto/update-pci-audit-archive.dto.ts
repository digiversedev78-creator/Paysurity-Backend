import { IsString, IsNotEmpty } from 'class-validator';

export class UpdatePciAuditArchiveDto {
  @IsString()
  @IsNotEmpty()
  readonly id: string;

  @IsString()
  @IsNotEmpty()
  readonly newStatus: string;
}
