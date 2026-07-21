import { baseLayout } from './base-layout';

export interface CandidateAcknowledgementData {
  candidateName: string;
  jobTitle: string;
  department: string;
}

export function candidateAcknowledgementTemplate(data: CandidateAcknowledgementData): {
  subject: string;
  html: string;
} {
  const body = `
    <p>Hi ${data.candidateName},</p>
    <p>Thank you for applying for the <strong>${data.jobTitle}</strong> position (${data.department}) at Rudraas Dynamics.</p>
    <p>We have received your application and our hiring team will review it shortly. If your profile is shortlisted, a recruiter will reach out to you directly with next steps.</p>
    <p>We appreciate your interest in building sovereign defence technology with us.</p>
    <p>— Rudraas Dynamics Talent Acquisition</p>
  `;
  return {
    subject: `We've received your application — ${data.jobTitle}`,
    html: baseLayout('Application received', body),
  };
}
