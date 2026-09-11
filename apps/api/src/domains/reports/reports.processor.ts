import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import * as fs from 'fs';

@Processor('reports_queue')
export class ReportsProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportsProcessor.name);

  constructor(@Inject('DATABASE') private readonly db: any) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing report job ${job.id} for merchant ${job.data.merchantId}`);
    
    // Simulate Gross/Net and PDF Generation
    const doc = new PDFDocument();
    const filePath = `/tmp/RPT-${job.id}.pdf`;
    
    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(20).text('Merchant Statement', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(14).text(`Merchant ID: ${job.data.merchantId}`);
    doc.text(`Available Liquidity (Net Settlement): $${job.data.availableLiquidity.toFixed(2)}`);
    doc.text(`Provisional Escrow (Locked Funds): $${job.data.provisionalEscrow.toFixed(2)}`);
    
    doc.end();
    
    this.logger.log(`Report PDF generated at ${filePath}`);
    return filePath;
  }
}
