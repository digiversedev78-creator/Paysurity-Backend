import { IsString, IsInt, IsDate, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CateringOrderItemResponseDto {
  @IsString()
  menuItemName: string;

  @IsInt()
  quantity: number;

  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

export class CateringOrderResponseDto {
  @IsString()
  orderId: string;

  @IsString()
  customerName: string;

  @IsString()
  deliveryAddress: string;

  @IsDate()
  @Type(() => Date)
  deliveryDate: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CateringOrderItemResponseDto)
  items: CateringOrderItemResponseDto[];

  @IsString()
  status: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updatedAt?: Date;
}
