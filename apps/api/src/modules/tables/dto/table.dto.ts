import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  Max,
  IsEnum,
  IsNotEmpty,
  IsPositive,
  Length
} from 'class-validator';


export class TableStatus {
  static readonly AVAILABLE = 'available';
  static readonly OCCUPIED = 'occupied';
  static readonly RESERVED = 'reserved';
  static readonly MAINTENANCE = 'maintenance';
  static readonly OUT_OF_SERVICE = 'out_of_service';

  static values(): string[] {
    return [
      TableStatus.AVAILABLE,
      TableStatus.OCCUPIED,
      TableStatus.RESERVED,
      TableStatus.MAINTENANCE,
      TableStatus.OUT_OF_SERVICE,
    ];
  }
}

export class TableShape {
  static readonly SQUARE = 'square';
  static readonly ROUND = 'round';
  static readonly RECTANGLE = 'rectangle';
  static readonly OVAL = 'oval';
  static readonly CUSTOM = 'custom';

  static values(): string[] {
    return [
      TableShape.SQUARE,
      TableShape.ROUND,
      TableShape.RECTANGLE,
      TableShape.OVAL,
      TableShape.CUSTOM,
    ];
  }
}

export class CreateTableDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  name: string;

  @IsString()
  @IsOptional()
  @Length(0, 255)
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Min(1)
  @Max(20) // Assuming a reasonable maximum capacity for a single table
  capacity: number;

  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  location: string; // e.g., "main_dining_hall", "patio", "private_room_1"

  @IsEnum(TableShape.values(), { message: `shape must be one of: ${TableShape.values().join(', ')}` })
  @IsNotEmpty()
  shape: string;

  @IsEnum(TableStatus.values(), { message: `status must be one of: ${TableStatus.values().join(', ')}` })
  @IsNotEmpty()
  status: string;

  @IsUUID()
  @IsNotEmpty()
  restaurantId: string; // The ID of the restaurant this table belongs to
}

export class UpdateTableDto extends (class {} as any) {
  // All properties inherited from CreateTableDto are made optional by PartialType.
  // Add any specific update-only validation rules here if needed.
}

export class TableQueryParamsDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10; // Default limit for pagination

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0; // Default offset for pagination

  @IsOptional()
  @IsString()
  @Length(1, 100)
  search?: string; // Generic search term for fields like name or description

  @IsOptional()
  @IsEnum(TableStatus.values(), { message: `status must be one of: ${TableStatus.values().join(', ')}` })
  status?: string;

  @IsOptional()
  @IsEnum(TableShape.values(), { message: `shape must be one of: ${TableShape.values().join(', ')}` })
  shape?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Min(1)
  capacityMin?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(20) // Max capacity for a table
  capacityMax?: number;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  location?: string;

  @IsOptional()
  @IsUUID()
  restaurantId?: string; // Optional if context already provides it (e.g., from auth token)
}


