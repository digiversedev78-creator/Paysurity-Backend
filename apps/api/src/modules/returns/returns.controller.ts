/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-003 -- Returns
 * FILE TYPE:    CONTROLLER
 * MODULE:       returns
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/POS_RETAIL.md
 * WORKER:       CODER-076
 * GENERATED:    2026-03-17T13:08:27.930Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { CreateReturnDto, UpdateReturnDto, ReturnQueryDto } from './dto/return.dto';

// Placeholder for custom decorators to extract tenantId and userId
// In a real app, these would come from an authentication guard/interceptor
// For example:
// import { GetUser, GetTenantId } from '../auth/decorators';
// userId: @GetUser('id'), tenantId: @GetTenantId()

// We'll simulate these by passing them as explicit params for this example.
// In a real NestJS app, you'd have auth middleware/guards populating req.user
// and custom decorators to extract them cleaner.

@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createReturnDto: CreateReturnDto,
    @Req() req: any, // Injected request object
  ) {
    // Simulate tenantId and userId from authentication context
    // In a real app, use custom decorators like @TenantId() tenantId: string, @UserId() userId: string
    const tenantId: string = req.user?.tenantId || 'simulated-tenant-id-123'; // Replace with actual tenant ID extraction
    const userId: string = req.user?.id || 'simulated-user-id-456'; // Replace with actual user ID extraction

    return (this.returnsService as any).create(tenantId, createReturnDto, userId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: ReturnQueryDto,
    @Req() req: any, // Injected request object
  ) {
    const tenantId: string = req.user?.tenantId || 'simulated-tenant-id-123'; // Replace with actual tenant ID extraction
    return (this.returnsService as any).findAll(tenantId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
    @Req() req: any, // Injected request object
  ) {
    const tenantId: string = req.user?.tenantId || 'simulated-tenant-id-123'; // Replace with actual tenant ID extraction
    return (this.returnsService as any).findOne(tenantId, id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateReturnDto: UpdateReturnDto,
    @Req() req: any, // Injected request object
  ) {
    const tenantId: string = req.user?.tenantId || 'simulated-tenant-id-123'; // Replace with actual tenant ID extraction
    const userId: string = req.user?.id || 'simulated-user-id-456'; // Replace with actual user ID extraction

    return (this.returnsService as any).update(tenantId, id, updateReturnDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Req() req: any, // Injected request object
  ) {
    const tenantId: string = req.user?.tenantId || 'simulated-tenant-id-123'; // Replace with actual tenant ID extraction
    const userId: string = req.user?.id || 'simulated-user-id-456'; // Replace with actual user ID extraction

    await (this.returnsService as any).remove(tenantId, id, userId);
  }
}

