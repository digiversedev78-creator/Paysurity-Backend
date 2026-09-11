/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  TAX-005 -- Tax Summary Report
 * FILE TYPE:    CONTROLLER
 * MODULE:       tax
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/TAX_ENGINE.md
 * WORKER:       CODER-021
 * GENERATED:    2026-03-17T13:07:25.581Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Controller, Get, Query, HttpCode, HttpStatus, UsePipes, ValidationPipe, Logger } from '@nestjs/common';
import { TaxService } from './tax.service';
import { GetTaxSummaryReportDto, TaxSummaryReportResponseDto } from './dto/tax-summary-report.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { TenantId } from '../auth/tenant-id.decorator';

@ApiBearerAuth()
@ApiTags('Tax')
@Controller('tax')
export class TaxController {
  private readonly logger = new Logger(TaxController.name);

  constructor(private readonly taxService: TaxService) {}

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a tax summary report for a given tax year and optional employee.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tax summary report successfully retrieved.', type: TaxSummaryReportResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input parameters.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  @ApiQuery({ name: 'taxYear', type: Number, description: 'The tax year for the report.', example: 2023 })
  @ApiQuery({ name: 'employeeId', type: String, required: false, description: 'Optional employee ID to filter the report.', example: 'EMP001' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getTaxSummaryReport(
    @TenantId() tenantId: string,
    @Query() dto: GetTaxSummaryReportDto,
  ): Promise<TaxSummaryReportResponseDto> {
    this.logger.log(`Received request for tax summary report for tenantId: ${tenantId}, taxYear: ${(dto as any).taxYear}, employeeId: ${(dto as any).employeeId || 'all'}`);
    return (this.taxService as any).getTaxSummaryReport(tenantId, dto);
  }
}




