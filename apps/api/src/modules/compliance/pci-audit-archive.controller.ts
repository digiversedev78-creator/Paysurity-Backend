import { Controller, Get, Post, Put, Delete, Param, Body, Query, NotFoundException, InternalServerErrorException, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
 // Adjust path as necessary
import { PciAuditArchiveService } from './pci-audit-archive.service';
import { CreatePciAuditArchiveDto } from './dto/create-pci-audit-archive.dto';
import { UpdatePciAuditArchiveDto } from './dto/update-pci-audit-archive.dto';
import { PciAuditArchiveQueryDto } from './dto/pci-audit-archive-query.dto';


@ApiTags('PCI Audit Archive')
@ApiBearerAuth()
@Controller('compliance/pci-audit-archive')
export class PciAuditArchiveController {
  constructor(private readonly pciAuditArchiveService: PciAuditArchiveService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new PCI audit archive record' })
  @ApiResponse({ status: 201, description: 'The PCI audit archive record has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(@Body() createDto: CreatePciAuditArchiveDto): Promise<any> {
    try {
      return await (this.pciAuditArchiveService as any).create(createDto);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create PCI audit archive record.');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all PCI audit archive records, with optional filtering and pagination' })
  @ApiResponse({ status: 200, description: 'List of PCI audit archive records.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findAll(@Query() queryParams: PciAuditArchiveQueryDto): Promise<any[]> {
    try {
      return await (this.pciAuditArchiveService as any).findAll(queryParams);
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve PCI audit archive records.');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a PCI audit archive record by ID' })
  @ApiResponse({ status: 200, description: 'The found PCI audit archive record.' })
  @ApiResponse({ status: 404, description: 'Record not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findOne(@Param('id') id: string): Promise<any> {
    const record = await (this.pciAuditArchiveService as any).findOne(id);
    if (!record) {
      throw new NotFoundException(`PCI Audit Archive record with ID "${id}" not found.`);
    }
    return record;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing PCI audit archive record by ID' })
  @ApiResponse({ status: 200, description: 'The PCI audit archive record has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Record not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async update(@Param('id') id: string, @Body() updateDto: UpdatePciAuditArchiveDto): Promise<any> {
    try {
      const updatedRecord = await (this.pciAuditArchiveService as any).update(id, updateDto);
      if (!updatedRecord) {
        throw new NotFoundException(`PCI Audit Archive record with ID "${id}" not found.`);
      }
      return updatedRecord;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update PCI audit archive record.');
    }
  }

  @Delete(':id')
  @HttpCode(204) // No Content on successful deletion
  @ApiOperation({ summary: 'Delete a PCI audit archive record by ID' })
  @ApiResponse({ status: 204, description: 'The PCI audit archive record has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Record not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async remove(@Param('id') id: string): Promise<void> {
    const deleted = await (this.pciAuditArchiveService as any).remove(id);
    if (!deleted) {
      throw new NotFoundException(`PCI Audit Archive record with ID "${id}" not found.`);
    }
  }
}

