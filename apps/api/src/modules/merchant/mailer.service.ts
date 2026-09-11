import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailerService {
  private resend: Resend;
  private readonly logger = new Logger(MailerService.name);

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_JYFLViuu_MPHn8ZmrLNxnvGMJCZZVWUxq');
  }

  async sendMagicLink(toEmail: string, applicationId: string) {
    if (!toEmail) return;
    try {
      const magicLink = `https://staging.paysurity.com/signup?resume=${applicationId}`;
      await this.resend.emails.send({
        from: 'onboarding@paysurity.com',
        to: toEmail,
        subject: 'Resume Your PaySurity Application securely',
        html: `<h2>PaySurity Secure Onboarding</h2>
               <p>We saved your progress. Click the secure link below to resume your merchant application exactly where you left off:</p>
               <br/>
               <a href="${magicLink}" style="padding:12px 24px;background-color:#3b82f6;color:white;text-decoration:none;border-radius:6px;font-weight:bold;">Resume Application</a>
               <br/><br/>
               <p>Or paste this link into your browser: ${magicLink}</p>`,
      });
      this.logger.log(`Magic link securely dispatched via Resend to ${toEmail}`);
    } catch (error: any) {
      this.logger.error(`Failed to dispatch magic link: ${error.message}`);
    }
  }
}
