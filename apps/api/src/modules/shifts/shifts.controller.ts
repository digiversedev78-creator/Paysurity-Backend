/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-011 -- Z-Report / Shift Close
 * FILE TYPE:    CONTROLLER
 * MODULE:       shifts
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * WORKER:       CODER-084
 * GENERATED:    2026-03-17T13:08:41.725Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Req,
  Query,
  HttpCode,
  HttpStatus,
  Optional} from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { ShiftResponseDto } from './dto/shift.dto';

// @UseGuards(AuthGuard) // Protect all shift endpoints -- REMOVED as per strict rule #4.
// Authentication and authorization are assumed to be handled globally,
// allowing `req.user` to be populated with `tenantId` and `id`.
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  /**
   * GET /shifts
   * Retrieves a list of shifts, optionally filtered by employee ID and/or date.
   *
   * @param req The request object, containing `req.user.tenantId` and `req.user.id`.
   * @param queryDto Optional query parameters for filtering (e.g., employeeId, date).
   * @returns A list of `ShiftResponseDto` objects.
   */
  @Get()
  async findAll(
    @Req() req: any,
    @Query() queryDto: any,
  ): Promise<ShiftResponseDto[]> {
    const tenantId = req?.user?.tenantId; // Strict Rule #5
    // req.user.id can be used for auditing or specific user-related queries if needed.
    return (this.shiftsService as any).findAll(tenantId, queryDto);
  }

  /**
   * POST /shifts
   * Creates a new shift for an employee within the tenant.
   *
   * Validation for no overlapping shifts for the same employee is expected to be handled
   * within the `shiftsService.create` method.
   *
   * @param req The request object, containing `req.user.tenantId` and `req.user.id`.
   * @param createShiftDto Data transfer object for creating a new shift.
   * @returns The newly created `ShiftResponseDto` object.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: any,
    @Body() createShiftDto: any,
  ): Promise<ShiftResponseDto> {
    const tenantId = req?.user?.tenantId; // Strict Rule #5
    const userId = req?.user?.id; // The user creating the shift, for auditing.
    return (this.shiftsService as any).create(tenantId, userId, createShiftDto);
  }

  /**
   * PUT /shifts/:id
   * Updates an existing shift for an employee within the tenant.
   *
   * Validation for no overlapping shifts for the same employee is expected to be handled
   * within the `shiftsService.update` method.
   *
   * @param req The request object, containing `req.user.tenantId` and `req.user.id`.
   * @param id The ID of the shift to update.
   * @param updateShiftDto Data transfer object for updating a shift.
   * @returns The updated `ShiftResponseDto` object.
   */
  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateShiftDto: any,
  ): Promise<ShiftResponseDto> {
    const tenantId = req?.user?.tenantId; // Strict Rule #5
    const userId = req?.user?.id; // The user updating the shift, for auditing.
    return (this.shiftsService as any).update(tenantId, userId, id, updateShiftDto);
  }

  /**
   * DELETE /shifts/:id
   * Deletes a shift by its ID for a given tenant.
   *
   * @param req The request object, containing `req.user.tenantId` and `req.user.id`.
   * @param id The ID of the shift to delete.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content for successful deletion
  async delete(@Req() req: any, @Param('id') id: string): Promise<void> {
    const tenantId = req?.user?.tenantId; // Strict Rule #5
    const userId = req?.user?.id; // The user performing the deletion, for auditing.
    await (this.shiftsService as any).delete(tenantId, userId, id);
  }

  /**
   * POST /shifts/:id/clock-in
   * Records a clock-in event for a specific shift.
   *
   * @param req The request object, containing `req.user.tenantId` and `req.user.id`.
   * @param id The ID of the shift to clock into.
   * @param clockDto Optional data for clock-in (e.g., specific timestamp).
   * @returns The updated `ShiftResponseDto` object after clock-in.
   */
  @Post(':id/clock-in')
  async clockIn(
    @Req() req: any,
    @Param('id') id: string,
    @Body() clockDto: any,
  ): Promise<ShiftResponseDto> {
    const tenantId = req?.user?.tenantId; // Strict Rule #5
    const userId = req?.user?.id; // The user performing the clock-in, for auditing.
    return (this.shiftsService as any).clockIn(tenantId, userId, id, clockDto);
  }

  /**
   * POST /shifts/:id/clock-out
   * Records a clock-out event for a specific shift.
   *
   * @param req The request object, containing `req.user.tenantId` and `req.user.id`.
   * @param id The ID of the shift to clock out from.
   * @param clockDto Optional data for clock-out (e.g., specific timestamp).
   * @returns The updated `ShiftResponseDto` object after clock-out.
   */
  @Post(':id/clock-out')
  async clockOut(
    @Req() req: any,
    @Param('id') id: string,
    @Body() clockDto: any,
  ): Promise<ShiftResponseDto> {
    const tenantId = req?.user?.tenantId; // Strict Rule #5
    const userId = req?.user?.id; // The user performing the clock-out, for auditing.
    return (this.shiftsService as any).clockOut(tenantId, userId, id, clockDto);
  }
}

