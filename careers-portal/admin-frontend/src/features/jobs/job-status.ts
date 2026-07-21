import type { BadgeProps } from '@/components/ui/badge'
import type { Job } from '@/features/jobs/types'

export interface JobStatusBadge {
  key: string
  label: string
  variant: BadgeProps['variant']
}

export function getJobStatusBadges(job: Pick<Job, 'isPublished' | 'isClosed' | 'isArchived' | 'isUrgent'>): JobStatusBadge[] {
  const badges: JobStatusBadge[] = []

  if (job.isArchived) {
    badges.push({ key: 'archived', label: 'Archived', variant: 'outline' })
  } else if (job.isClosed) {
    badges.push({ key: 'closed', label: 'Closed', variant: 'secondary' })
  } else if (job.isPublished) {
    badges.push({ key: 'published', label: 'Published', variant: 'success' })
  } else {
    badges.push({ key: 'draft', label: 'Draft', variant: 'outline' })
  }

  if (job.isUrgent) {
    badges.push({ key: 'urgent', label: 'Urgent', variant: 'destructive' })
  }

  return badges
}
