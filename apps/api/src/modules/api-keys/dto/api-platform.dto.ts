import { IsString, IsArray, IsUrl, IsUUID, IsOptional } from 'class-validator';

export class RegisterWebhookDto {
  @IsUrl()
  url: string;

  @IsArray()
  @IsString({ each: true })
  events: string[];

  @IsOptional()
  @IsString()
  secret?: string;
}

export class GenerateApiKeyDto {
  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  scopes: string[];

  @IsUUID()
  tenantId: string;
}

export class WebhookTestDto {
  @IsUUID()
  webhookId: string;
}
