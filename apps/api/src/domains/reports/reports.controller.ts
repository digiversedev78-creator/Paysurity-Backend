/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  MER-008 -- Statement/1099-K
 * FILE TYPE:    CONTROLLER
 * MODULE:       reports
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/MER_MERCHANT_SERVICES_ONBOARDING.md
 * WORKER:       CODER-116
 * GENERATED:    2026-03-17T13:10:57.560Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Logger, InternalServerErrorException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { GenerateMerchantStatementDto, ReportGenerationResponseDto } from './dto/generate-merchant-statement.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantId } from '../common/decorators/tenant-id.decorator'; // Custom decorator to extract tenantId
import { UserId } from '../common/decorators/user-id.decorator';   // Custom decorator to extract userId

@ApiTags('Reports')
@ApiBearerAuth() // Indicates that this endpoint requires a bearer token for authentication
@UseGuards(AuthGuard('jwt')) // Protects the endpoint using JWT authentication strategy
@Controller('reports/merchants')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(private readonly reportsService: ReportsService) {}

  @Post('statements/generate')
  @HttpCode(HttpStatus.ACCEPTED) // Indicates that the request has been accepted for processing, but not yet completed
  @ApiOperation({
    summary: 'Generate merchant statement or 1099-K report',
    description: 'Initiates the generation of a financial statement or a 1099-K tax form for a specified merchant and year. The report generation might be asynchronous.',
  })
  @ApiBody({
    type: GenerateMerchantStatementDto,
    description: 'Parameters required to generate the merchant report.',
    examples: {
      statement:
        { summary: 'Generate Statement',
          value: { merchantId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', year: 2023, reportType: 'STATEMENT', format: 'PDF' } },
      _1099k:
        { summary: 'Generate 1099-K',
          value: { merchantId: 'f1e2d3c4-b5a6-7890-1234-567890fedcba', year: 2023, reportType: '1099K', format: 'PDF' } }
    }
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Report generation request accepted. The response contains a report ID and potentially a download URL or status.',
    type: ReportGenerationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input parameters provided in the request body.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Merchant not found for the given tenant or no sufficient data available for report generation.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'An unexpected error occurred during the report generation process.',
  })
  async generateMerchantStatement(
    @Body() generateDto: GenerateMerchantStatementDto,
    @TenantId() tenantId: string, // Extracts tenant ID from the authenticated user's context
    @UserId() userId: string,     // Extracts user ID from the authenticated user's context for audit logging
  ): Promise<ReportGenerationResponseDto> {
    this.logger.log(`Received request to generate report for merchant \"${generateDto.merchantId}\" (Type: ${generateDto.type}, Year: ${generateDto.startDate ? new Date(generateDto.startDate).getFullYear().toString() : new Date().getFullYear().toString()}) from user \"${userId}\" for tenant \"${tenantId}\".`);

    // Ensure tenantId and userId are available from the authentication context.
    // These are critical for multi-tenancy and audit logging.
    if (!tenantId) {
      this.logger.error('Tenant ID is missing from the request context.');
      throw new InternalServerErrorException('Tenant ID is missing. Cannot process request.');
    }
    if (!userId) {
      this.logger.error('User ID is missing from the request context.');
      throw new InternalServerErrorException('User ID is missing. Cannot process request for audit logging.');
    }

    // Delegate the complex report generation logic to the service layer.
    return this.reportsService.generateMerchantStatementReport(generateDto, tenantId, userId);
  }
}
