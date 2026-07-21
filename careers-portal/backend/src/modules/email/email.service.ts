import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import {
  candidateAcknowledgementTemplate,
  CandidateAcknowledgementData,
} from './templates/candidate-acknowledgement.template';
import {
  hrNewApplicationTemplate,
  HrNewApplicationData,
} from './templates/hr-new-application.template';
import {
  adminUrgentOpeningTemplate,
  AdminUrgentOpeningData,
} from './templates/admin-urgent-opening.template';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;
  private from: string;
  private hrEmails: string[];
  private adminEmails: string[];
  private adminBaseUrl: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const smtp = this.config.get('smtp');
    this.transporter = createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: { user: smtp.user, pass: smtp.password },
    });
    this.from = smtp.from;
    this.hrEmails = this.config.get<string[]>('notifications.hrEmails') ?? [];
    this.adminEmails = this.config.get<string[]>('notifications.adminEmails') ?? [];
    this.adminBaseUrl = this.config.get<string>('webOrigins.admin') ?? 'https://career.rudraas.com';
  }

  private async send(to: string | string[], subject: string, html: string): Promise<void> {
    const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
    if (recipients.length === 0) return;

    try {
      await this.transporter.sendMail({ from: this.from, to: recipients.join(','), subject, html });
    } catch (error) {
      // Email delivery must never fail the calling business transaction (e.g. an application
      // submission). Failures are logged for operational follow-up instead of thrown.
      this.logger.error(`Failed to send email "${subject}" to ${recipients.join(',')}: ${error}`);
    }
  }

  async sendCandidateAcknowledgement(to: string, data: CandidateAcknowledgementData): Promise<void> {
    const { subject, html } = candidateAcknowledgementTemplate(data);
    await this.send(to, subject, html);
  }

  async sendHrNewApplicationAlert(data: Omit<HrNewApplicationData, 'adminBaseUrl'>): Promise<void> {
    const { subject, html } = hrNewApplicationTemplate({ ...data, adminBaseUrl: this.adminBaseUrl });
    await this.send(this.hrEmails, subject, html);
  }

  async sendAdminUrgentOpeningAlert(data: Omit<AdminUrgentOpeningData, 'adminBaseUrl'>): Promise<void> {
    const { subject, html } = adminUrgentOpeningTemplate({ ...data, adminBaseUrl: this.adminBaseUrl });
    await this.send(this.adminEmails, subject, html);
  }
}
