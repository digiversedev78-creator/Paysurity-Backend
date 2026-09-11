/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSG-013 -- Vendor Management
 * FILE TYPE:    CONTROLLER
 * MODULE:       vendors
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/POSG_POS_GROCERY.md
 * WORKER:       CODER-071
 * GENERATED:    2026-03-17T13:08:22.227Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import {  Controller, Get, Post, Body, Put, Param, Delete, HttpCode, HttpStatus, Query, UsePipes, ValidationPipe  } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto, UpdateVendorDto, VendorQueryDto } from './dto/vendor.dto';

import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetTenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => 'mock-tenant-id-123',
);

export const GetUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => 'mock-user-id-456',
);
@Controller('vendors')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @GetTenantId() tenantId: string,
    @GetUserId() userId: string,
    @Body() createVendorDto: CreateVendorDto
  ) {
    return (this.vendorsService as any).create(tenantId, userId, createVendorDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @GetTenantId() tenantId: string,
    @Query() query: VendorQueryDto
  ) {
    return (this.vendorsService as any).findAll(tenantId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @GetTenantId() tenantId: string,
    @Param('id') id: string
  ) {
    return (this.vendorsService as any).findOne(tenantId, id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @GetTenantId() tenantId: string,
    @GetUserId() userId: string,
    @Param('id') id: string,
    @Body() updateVendorDto: UpdateVendorDto
  ) {
    return (this.vendorsService as any).update(tenantId, userId, id, updateVendorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @GetTenantId() tenantId: string,
    @GetUserId() userId: string,
    @Param('id') id: string
  ) {
    await (this.vendorsService as any).remove(tenantId, userId, id);
  }
}

