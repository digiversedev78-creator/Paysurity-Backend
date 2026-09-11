/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSR-012 -- Table & Seating Management
 * FILE TYPE:    CONTROLLER
 * MODULE:       tables
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * WORKER:       CODER-058
 * GENERATED:    2026-03-17T13:07:31.497Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Controller, Get, Post, Put, Param, Body, Query, Req, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { TablesService } from './tables.service';
// Removed AuthGuard import as per strict rule: @UseGuards() is not allowed.
import { Request } from 'express'; // For req.user access
import { IsString, IsEnum, IsUUID, IsArray, IsOptional, IsNumber, IsDefined } from 'class-validator'; // Added for DTO validation
import { Type } from 'class-transformer'; // Added for DTO transformation (e.g. for numbers or splitting strings)

type AuthenticatedRequest = any;

// Define new DTOs and Enums for table and floor plan management
// These DTOs are defined here to satisfy rule #4, assuming they are not imported from restricted paths.

/**
 * Enum for defining the various states a table can be in.
 */
export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
  OUT_OF_SERVICE = 'out_of_service', // Added for completeness, e.g., for repairs
  MERGED = 'merged', // For tables that are part of a merged entity
}

/**
 * DTO for creating a new floor plan.
 */
export class CreateFloorPlanDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  // No specific validation for layoutJson as its structure is generic 'any'
  layoutJson: any; // JSON representation of the floor plan layout (e.g., table positions, sizes)
  // restaurantId is assumed to be derived from tenant context for simplicity, or added if multi-location tenants.
  // For now, let's keep it implicitly tied to the tenant's primary restaurant/location.
}

/**
 * DTO for updating an existing floor plan.
 */
export class UpdateFloorPlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  // No specific validation for layoutJson as its structure is generic 'any'
  @IsOptional()
  layoutJson?: any;
}

/**
 * DTO for updating a table's status.
 */
export class UpdateTableStatusDto {
  @IsEnum(TableStatus)
  status: TableStatus;

  @IsOptional()
  @IsUUID()
  orderId?: string | null; // Optional: if status becomes occupied/reserved, link to an order. Nullable for unassigning.
}

/**
 * DTO for creating a new table.
 */
export class CreateTableDto {
  @IsNumber()
  @Type(() => Number)
  tableNumber: number;

  @IsNumber()
  @Type(() => Number)
  capacity: number;

  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus = TableStatus.AVAILABLE; // Default to available

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  x?: number; // Position on floor plan

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  y?: number; // Position on floor plan

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  width?: number; // Size on floor plan

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  height?: number; // Size on floor plan

  @IsOptional()
  @IsUUID()
  floorPlanId?: string; // Link to a specific floor plan
}

/**
 * DTO for updating an existing table's properties (not just status).
 * Not used by current task but keeping it defined as it was in initial imports.
 */
export class UpdateTableDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  tableNumber?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  capacity?: number;

  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  x?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  y?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  width?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  height?: number;

  @IsOptional()
  @IsUUID()
  floorPlanId?: string;
}

/**
 * DTO for querying tables with various filters.
 */
export class TableQueryParamsDto {
  @IsOptional()
  @IsArray()
  @IsEnum(TableStatus, { each: true })
  @Type(() => String) // Required for query params, if they come as comma-separated string
  status?: TableStatus[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minCapacity?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxCapacity?: number;
}

/**
 * DTO for assigning an order to a table.
 */
export class AssignOrderDto {
  @IsUUID()
  orderId: string;
}

/**
 * DTO for merging multiple tables.
 */
export class MergeTablesDto {
  @IsArray()
  @IsUUID(undefined, { each: true }) // Validate each item in the array as a UUID
  tableIds: string[];
}

/**
 * DTO for splitting a table.
 */
export class SplitTableBodyDto {
  @IsUUID()
  @IsDefined()
  tableId: string;
}


@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  /**
   * GET /tables
   * Retrieves a list of tables, optionally filtered by status and capacity.
   * @param req The authenticated request object to extract tenantId.
   * @param query DTO for query parameters (status, minCapacity, maxCapacity).
   * @returns A list of tables belonging to the tenant.
   */
  @Get()
  async findAll(@Req() req: AuthenticatedRequest, @Query() query: TableQueryParamsDto) {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID not found in request context.');
    }
    return (this.tablesService as any).findAll(tenantId, query);
  }

  /**
   * POST /tables
   * Creates a new table for the tenant.
   * @param req The authenticated request object to extract tenantId.
   * @param createTableDto DTO containing details for the new table.
   * @returns The newly created table.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: AuthenticatedRequest, @Body() createTableDto: CreateTableDto) {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID not found in request context.');
    }
    return (this.tablesService as any).create(tenantId, createTableDto);
  }

  /**
   * PUT /tables/:id/status
   * Updates the status of a specific table.
   * @param req The authenticated request object to extract tenantId.
   * @param id The UUID of the table to update.
   * @param updateTableStatusDto DTO containing the new status and optional orderId.
   * @returns The updated table.
   */
  @Put(':id/status')
  async updateStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateTableStatusDto: UpdateTableStatusDto,
  ) {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID not found in request context.');
    }
    return (this.tablesService as any).updateStatus(tenantId, id, updateTableStatusDto);
  }

  /**
   * POST /tables/:id/assign-order
   * Assigns an order to a table, typically setting its status to OCCUPIED or RESERVED.
   * @param req The authenticated request object to extract tenantId.
   * @param id The UUID of the table to assign the order to.
   * @param assignOrderDto DTO containing the orderId to assign.
   * @returns The updated table.
   */
  @Post(':id/assign-order')
  @HttpCode(HttpStatus.OK)
  async assignOrder(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() assignOrderDto: AssignOrderDto,
  ) {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID not found in request context.');
    }
    return (this.tablesService as any).assignOrder(tenantId, id, (assignOrderDto as any).orderId);
  }

  /**
   * POST /tables/merge
   * Merges multiple tables into a single logical table entity.
   * The service layer will handle the specifics of how tables are merged (e.g., creating a new table entity
   * representing the merged group or updating existing tables).
   * @param req The authenticated request object to extract tenantId.
   * @param mergeTablesDto DTO containing an array of table UUIDs to merge.
   * @returns An array of the affected (merged) tables or the new merged entity.
   */
  @Post('merge')
  @HttpCode(HttpStatus.OK)
  async mergeTables(@Req() req: AuthenticatedRequest, @Body() mergeTablesDto: MergeTablesDto) {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID not found in request context.');
    }
    return (this.tablesService as any).mergeTables(tenantId, (mergeTablesDto as any).tableIds);
  }

  /**
   * POST /tables/split
   * Splits a previously merged table, or a table that can be logically split, into multiple individual tables.
   * The service layer will determine the logic for splitting.
   * @param req The authenticated request object to extract tenantId.
   * @param splitTableBodyDto DTO containing the UUID of the table to split.
   * @returns An array of the newly split tables.
   */
  @Post('split')
  @HttpCode(HttpStatus.OK)
  async splitTable(@Req() req: AuthenticatedRequest, @Body() splitTableBodyDto: SplitTableBodyDto) {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID not found in request context.');
    }
    return (this.tablesService as any).splitTable(tenantId, (splitTableBodyDto as any).tableId);
  }
}




