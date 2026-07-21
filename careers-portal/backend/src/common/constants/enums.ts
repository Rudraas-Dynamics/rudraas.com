export enum Role {
  ADMIN = 'ADMIN',
  HR = 'HR',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  FREELANCE = 'FREELANCE',
}

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  SCREENING = 'SCREENING',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  TECHNICAL_ROUND = 'TECHNICAL_ROUND',
  HR_ROUND = 'HR_ROUND',
  FINAL_DISCUSSION = 'FINAL_DISCUSSION',
  SELECTED = 'SELECTED',
  REJECTED = 'REJECTED',
  OFFER_RELEASED = 'OFFER_RELEASED',
  JOINED = 'JOINED',
  WITHDRAWN = 'WITHDRAWN',
}

/** Ordered pipeline used by dashboard funnel charts; terminal/exit statuses are excluded. */
export const APPLICATION_PIPELINE_ORDER: ApplicationStatus[] = [
  ApplicationStatus.APPLIED,
  ApplicationStatus.SCREENING,
  ApplicationStatus.SHORTLISTED,
  ApplicationStatus.INTERVIEW_SCHEDULED,
  ApplicationStatus.TECHNICAL_ROUND,
  ApplicationStatus.HR_ROUND,
  ApplicationStatus.FINAL_DISCUSSION,
  ApplicationStatus.SELECTED,
  ApplicationStatus.OFFER_RELEASED,
  ApplicationStatus.JOINED,
];

export enum CandidateSource {
  WEBSITE = 'WEBSITE',
  LINKEDIN = 'LINKEDIN',
  NAUKRI = 'NAUKRI',
  REFERRAL = 'REFERRAL',
  CAMPUS = 'CAMPUS',
  WALK_IN = 'WALK_IN',
  RECRUITER = 'RECRUITER',
  CONSULTANCY = 'CONSULTANCY',
  OTHER = 'OTHER',
}

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  PUBLISH = 'PUBLISH',
  CLOSE = 'CLOSE',
  ARCHIVE = 'ARCHIVE',
  MARK_URGENT = 'MARK_URGENT',
  DUPLICATE = 'DUPLICATE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  BULK_STATUS_CHANGE = 'BULK_STATUS_CHANGE',
  RESUME_DOWNLOAD = 'RESUME_DOWNLOAD',
  EXPORT = 'EXPORT',
  PASSWORD_RESET = 'PASSWORD_RESET',
  DEACTIVATE = 'DEACTIVATE',
  ACTIVATE = 'ACTIVATE',
}

export enum AuditEntityType {
  USER = 'USER',
  JOB = 'JOB',
  APPLICATION = 'APPLICATION',
  AUTH = 'AUTH',
}

export const PASSWORD_MIN_LENGTH = 10;
export const RESUME_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const RESUME_ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const RESUME_ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
