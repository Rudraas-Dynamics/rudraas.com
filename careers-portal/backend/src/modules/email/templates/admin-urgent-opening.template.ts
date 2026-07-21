import { baseLayout } from './base-layout';

export interface AdminUrgentOpeningData {
  jobTitle: string;
  department: string;
  location: string;
  createdByName: string;
  adminBaseUrl: string;
  jobId: string;
}

export function adminUrgentOpeningTemplate(data: AdminUrgentOpeningData): {
  subject: string;
  html: string;
} {
  const link = `${data.adminBaseUrl}/jobs/${data.jobId}`;
  const body = `
    <p><strong>${data.createdByName}</strong> marked a job opening as <strong style="color:#b91c1c;">URGENT HIRING</strong>.</p>
    <table role="presentation" cellpadding="6" cellspacing="0" style="margin-top:12px;">
      <tr><td style="color:#666;">Role</td><td><strong>${data.jobTitle}</strong></td></tr>
      <tr><td style="color:#666;">Department</td><td>${data.department}</td></tr>
      <tr><td style="color:#666;">Location</td><td>${data.location}</td></tr>
    </table>
    <p style="margin-top:20px;">
      <a href="${link}" style="background:#050912;color:#F2EFE6;padding:10px 20px;border-radius:4px;text-decoration:none;display:inline-block;">
        View Opening
      </a>
    </p>
  `;
  return {
    subject: `Urgent hiring: ${data.jobTitle}`,
    html: baseLayout('Urgent opening', body),
  };
}
