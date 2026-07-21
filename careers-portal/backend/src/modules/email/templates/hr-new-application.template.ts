import { baseLayout } from './base-layout';

export interface HrNewApplicationData {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  experienceYears: number;
  source: string;
  adminBaseUrl: string;
  applicationId: string;
}

export function hrNewApplicationTemplate(data: HrNewApplicationData): { subject: string; html: string } {
  const link = `${data.adminBaseUrl}/applications/${data.applicationId}`;
  const body = `
    <p>A new application has been received for <strong>${data.jobTitle}</strong>.</p>
    <table role="presentation" cellpadding="6" cellspacing="0" style="margin-top:12px;">
      <tr><td style="color:#666;">Candidate</td><td><strong>${data.candidateName}</strong></td></tr>
      <tr><td style="color:#666;">Email</td><td>${data.candidateEmail}</td></tr>
      <tr><td style="color:#666;">Experience</td><td>${data.experienceYears} years</td></tr>
      <tr><td style="color:#666;">Source</td><td>${data.source}</td></tr>
    </table>
    <p style="margin-top:20px;">
      <a href="${link}" style="background:#050912;color:#F2EFE6;padding:10px 20px;border-radius:4px;text-decoration:none;display:inline-block;">
        View Application
      </a>
    </p>
  `;
  return {
    subject: `New application: ${data.jobTitle} — ${data.candidateName}`,
    html: baseLayout('New application received', body),
  };
}
