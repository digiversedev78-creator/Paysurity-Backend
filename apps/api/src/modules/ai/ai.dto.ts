import { IsString, IsNotEmpty, IsUUID, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAiChatSessionDto {
  @IsOptional()
  context?: Record<string, any>;
}

export class SendMessageDto {
  @IsUUID()
  @IsOptional()
  sessionId?: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class GetChatHistoryDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit?: number = 50;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;
}
