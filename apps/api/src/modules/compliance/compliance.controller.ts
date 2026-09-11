import { Controller, Get, Post, Body, Param, Logger } from '@nestjs/common';
import { ComplianceService } from './compliance.service';

@Controller('compliance') // Changed to 'compliance', @UseGuards removed as per task
export class ComplianceController {
  private readonly logger = new Logger(ComplianceController.name);

  constructor(private readonly complianceService: ComplianceService) {}

  /**
   * Retrieves a list of PCI archives.
   * @returns An array of PCI archive records.
   */
  @Get('pci-archives')
  async getPciArchives(): Promise<any[]> {
    this.logger.log('Fetching all PCI archives.');
    return (this.complianceService as any).getPciArchives();
  }

  /**
   * Creates a new PCI archive record.
   * @param archiveData The data for the new PCI archive.
   * @returns The created PCI archive record.
   */
  @Post('pci-archives')
  async createPciArchive(@Body() archiveData: any): Promise<any> {
    this.logger.log('Creating a new PCI archive.');
    return (this.complianceService as any).createPciArchive(archiveData);
  }

  /**
   * Retrieves a specific PCI archive by its ID.
   * @param id The ID of the PCI archive.
   * @returns The PCI archive record.
   */
  @Get('pci-archives/:id')
  async getPciArchiveById(@Param('id') id: string): Promise<any> {
    this.logger.log(`Fetching PCI archive with ID: ${id}.`);
    return (this.complianceService as any).getPciArchiveById(id);
  }

  /**
   * Checks the compliance status for a specific payroll run.
   * @param runId The ID of the payroll run.
   * @returns The compliance status for the payroll run.
   */
  @Get('payroll/:runId/check')
  async checkPayrollCompliance(@Param('runId') runId: string): Promise<any> {
    this.logger.log(`Checking payroll compliance for run ID: ${runId}.`);
    return (this.complianceService as any).checkPayrollCompliance(runId);
  }
}


