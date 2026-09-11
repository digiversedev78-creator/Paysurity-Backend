import {
  Controller, Get, Post, Put, Delete, Body, Param,
  HttpCode, HttpStatus, Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { FeatureFlagService } from './feature-flag.service';

@ApiTags('featureflag')
@Controller('v1/feature-flag')
@ApiBearerAuth('JWT-auth')
export class FeatureFlagController {
  constructor(private readonly service: FeatureFlagService) {}

  @Get()
  @ApiOperation({ summary: 'List all featureflag records' })
  async findAll(@Request() req: any) {
    const data = await this.service.findAll(req.user.tenantId);
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get featureflag by ID' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    const data = await this.service.findById(id, req.user.tenantId);
    return { data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new featureflag' })
  async create(@Body() body: any, @Request() req: any) {
    const data = await this.service.create(req.user.tenantId, body);
    return { data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update featureflag' })
  async update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const data = await this.service.update(id, req.user.tenantId, body);
    return { data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete featureflag' })
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.service.delete(id, req.user.tenantId);
  }
}
