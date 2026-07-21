import type { EmploymentType } from '@/lib/career-api'

const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
}

export function formatEmploymentType(type: EmploymentType | string): string {
  return EMPLOYMENT_TYPE_LABELS[type as EmploymentType] ?? type
}

export function formatExperienceRange(minYears: number, maxYears: number): string {
  if (minYears === maxYears) return `${minYears} yrs`
  return `${minYears}–${maxYears} yrs`
}
