import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreateApiKeyDto {
  @ApiProperty({ description: 'The name of the API key' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The scopes of the API key', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  scopes?: string[];
}
