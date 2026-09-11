import {
  IsUUID,
  IsInt,
  Min,
  IsString,
  IsOptional,
  IsNotEmpty
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EarnPointsDto {
  @ApiProperty({
    description: 'The unique identifier of the user earning points.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  @IsNotEmpty({ message: 'userId cannot be empty' })
  userId: string;

  @ApiProperty({
    description: 'The unique identifier of the loyalty program.',
    example: 'fedcba98-7654-3210-fedc-ba9876543210',
  })
  @IsUUID('4', { message: 'loyaltyProgramId must be a valid UUID' })
  @IsNotEmpty({ message: 'loyaltyProgramId cannot be empty' })
  loyaltyProgramId: string;

  @ApiProperty({
    description: 'The number of points to be earned. Must be a positive integer.',
    example: 100,
    minimum: 1,
  })
  @IsInt({ message: 'pointsAmount must be an integer' })
  @Min(1, { message: 'pointsAmount must be at least 1' })
  @IsNotEmpty({ message: 'pointsAmount cannot be empty' })
  pointsAmount: number;

  @ApiProperty({
    description: 'Optional ID of the transaction or event that triggered these points.',
    example: 'txn_xyz123',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'sourceTransactionId must be a string' })
  @IsNotEmpty({ message: 'sourceTransactionId cannot be an empty string if provided' })
  sourceTransactionId?: string;

  @ApiProperty({
    description: 'Optional description or reason for earning these points.',
    example: 'Points earned for a purchase of $50.',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @IsNotEmpty({ message: 'description cannot be an empty string if provided' })
  description?: string;
}
