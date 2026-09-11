import { Controller, Post, Get, Param, UseInterceptors, UploadedFile, Req, Ip, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminFilesService } from './admin-files.service';
import { RequireRole } from './decorators/require-role.decorator';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { Request } from 'express';

type CustomRequest = any;

@Controller('admin/files')
@UseGuards(AdminRoleGuard)
@RequireRole('SUPER_ADMIN')
export class AdminFilesController {
  constructor(private readonly filesService: AdminFilesService) {}

  @Post(':tenantId/compliance')
  @UseInterceptors(FileInterceptor('file'))
  async uploadComplianceDoc(
    @Param('tenantId') tenantId: string,
    @UploadedFile() file: any,
    @Req() req: CustomRequest,
    @Ip() ip: string,
  ) {
    if (!file) throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
    return (this.filesService as any).uploadComplianceDocument(tenantId, file, req.adminUser, ip);
  }

  @Post(':tenantId/pos-blob')
  @UseInterceptors(FileInterceptor('blob'))
  async uploadPosBlob(
    @Param('tenantId') tenantId: string,
    @UploadedFile() file: any,
    @Req() req: CustomRequest,
    @Ip() ip: string,
  ) {
    if (!file) throw new HttpException('Blob is required', HttpStatus.BAD_REQUEST);
    return (this.filesService as any).parseReceiptBlob(tenantId, file.buffer, req.adminUser, ip);
  }

  @Get(':tenantId/compliance/:documentId')
  async downloadComplianceDoc(
    @Param('tenantId') tenantId: string,
    @Param('documentId') documentId: string,
    @Req() req: CustomRequest,
    @Ip() ip: string,
  ) {
    return (this.filesService as any).downloadComplianceDocument(tenantId, documentId, req.adminUser, ip);
  }
}


