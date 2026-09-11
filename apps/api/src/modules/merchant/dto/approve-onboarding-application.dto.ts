import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveOnboardingApplicationDto {
  @IsUUID('4', { message: 'Application ID must be a valid UUID v4' })
  applicationId: string;

  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @MaxLength(500, { message: 'Notes cannot exceed 500 characters' })
  notes?: string;
}
