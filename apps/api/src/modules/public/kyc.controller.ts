import { Controller, Get, Post, Req, Query, Param, UnauthorizedException, Res } from '@nestjs/common';
const db: any = {};
import { v4 as uuidv4 } from 'uuid'; // Enforcing UUIDv4 for IDOR protection

@Controller('kyc')
export class KycController {
  private allowedRedirects = new Set(['https://paysurity.com', 'https://app.paysurity.com']);

  @Get('document/:uuid')
  async getDocument(@Param('uuid') uuid: string, @Req() req) {
    // IDOR protection: Verify owner
    const document = await db.getDocument(uuid);
    if (document.ownerId !== req.user.id) throw new UnauthorizedException('Unauthorized access to KYC document');
    return document;
  }
  
  @Get('redirect')
  async handleMarketingRedirect(@Query('next') next: string, @Res() res) {
    if (!this.allowedRedirects.has(next)) {
       return res.redirect('https://paysurity.com'); // Open Redirect mitigation
    }
    return res.redirect(next);
  }
}




