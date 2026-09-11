import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePciAuditArchiveDto {
  @IsString()
  @IsNotEmpty()
  readonly archiveId: string;
}
