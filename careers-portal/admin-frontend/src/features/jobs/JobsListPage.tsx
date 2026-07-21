import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight, MoreHorizontal, Plus } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { getApiErrorMessage } from '@/lib/api-client'
import { usePageTitle } from '@/components/layout/page-header-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/features/auth/auth-context'
import { DeleteJobDialog } from '@/features/jobs/DeleteJobDialog'
import { getJobStatusBadges } from '@/features/jobs/job-status'
import { jobsListQueryKey, listJobs } from '@/features/jobs/jobs-api'
import {
  EMPLOYMENT_TYPE_LABELS,
  EMPLOYMENT_TYPES,
  type EmploymentType,
  type Job,
  type JobListQuery,
  type JobStatusFilter,
} from '@/features/jobs/types'
import { useJobActionMutations } from '@/features/jobs/use-job-actions'

const PAGE_LIMIT = 20

const STATUS_FILTER_OPTIONS: { value: JobStatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'ARCHIVED', label: 'Archived' },
  { value: 'URGENT', label: 'Urgent only' },
]

function statusFilterToQuery(status: JobStatusFilter): Partial<JobListQuery> {
  switch (status) {
    case 'DRAFT':
      return { isPublished: false }
    case 'PUBLISHED':
      return { isPublished: true }
    case 'CLOSED':
      return { isClosed: true }
    case 'ARCHIVED':
      return { isArchived: true }
    case 'URGENT':
      return { isUrgent: true }
    default:
      return {}
  }
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}

type SetSearchParams = ReturnType<typeof useSearchParams>[1]

function useDebouncedFilter(searchParams: URLSearchParams, setSearchParams: SetSearchParams, key: string) {
  const [draft, setDraft] = useState(() => searchParams.get(key) ?? '')
  const debounced = useDebouncedValue(draft, 400)

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const current = prev.get(key) ?? ''
        if (current === debounced) return prev
        const next = new URLSearchParams(prev)
        if (debounced) next.set(key, debounced)
        else next.delete(key)
        next.set('page', '1')
        return next
      },
      { replace: true },
    )
  }, [debounced, key, setSearchParams])

  return [draft, setDraft] as const
}

function formatCreatedAt(value: string): string {
  try {
    return format(new Date(value), 'MMM d, yyyy')
  } catch {
    return '—'
  }
}

function JobRowActions({ job }: { job: Job }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const { publishMutation, closeMutation, archiveMutation, urgentMutation, duplicateMutation } =
    useJobActionMutations(job)

  const isMutating =
    publishMutation.isPending ||
    closeMutation.isPending ||
    archiveMutation.isPending ||
    urgentMutation.isPending ||
    duplicateMutation.isPending

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${job.title}`} disabled={isMutating}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!job.isPublished && !job.isArchived ? (
            <DropdownMenuItem onSelect={() => publishMutation.mutate()}>Publish</DropdownMenuItem>
          ) : null}
          {job.isPublished && !job.isClosed && !job.isArchived ? (
            <DropdownMenuItem onSelect={() => closeMutation.mutate()}>Close</DropdownMenuItem>
          ) : null}
          {!job.isArchived ? (
            <DropdownMenuItem onSelect={() => archiveMutation.mutate()}>Archive</DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onSelect={() => urgentMutation.mutate()}>
            {job.isUrgent ? 'Remove urgent flag' : 'Mark urgent'}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => duplicateMutation.mutate()}>Duplicate</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setIsDeleteOpen(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteJobDialog job={job} open={isDeleteOpen} onOpenChange={setIsDeleteOpen} />
    </div>
  )
}

export default function JobsListPage() {
  usePageTitle('Jobs')
  const { user } = useAuth()
  const isHr = user?.role === 'HR'
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get('page') ?? '1') || 1
  const department = searchParams.get('department') ?? ''
  const location = searchParams.get('location') ?? ''
  const employmentType = (searchParams.get('employmentType') ?? '') as EmploymentType | ''
  const status = (searchParams.get('status') ?? 'ALL') as JobStatusFilter
  const search = searchParams.get('search') ?? ''

  const [searchDraft, setSearchDraft] = useDebouncedFilter(searchParams, setSearchParams, 'search')
  const [departmentDraft, setDepartmentDraft] = useDebouncedFilter(searchParams, setSearchParams, 'department')
  const [locationDraft, setLocationDraft] = useDebouncedFilter(searchParams, setSearchParams, 'location')

  function updateFilter(key: string, value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      next.set('page', '1')
      return next
    })
  }

  function goToPage(nextPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(nextPage))
      return next
    })
  }

  const query: JobListQuery = useMemo(
    () => ({
      page,
      limit: PAGE_LIMIT,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      search: search || undefined,
      department: department || undefined,
      location: location || undefined,
      employmentType: employmentType || undefined,
      ...statusFilterToQuery(status),
    }),
    [page, search, department, location, employmentType, status],
  )

  const { data, isLoading, isError, error } = useQuery({
    queryKey: jobsListQueryKey(query),
    queryFn: () => listJobs(query),
    placeholderData: (previous) => previous,
  })

  const jobs = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold">Jobs</h2>
          <p className="text-sm text-muted-foreground">
            Manage open requisitions, publish postings, and track pipeline status.
          </p>
        </div>
        {isHr ? (
          <Button onClick={() => navigate('/jobs/new')}>
            <Plus className="h-4 w-4" />
            New job
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
          placeholder="Search title or skills…"
          className="w-56"
        />
        <Input
          value={departmentDraft}
          onChange={(event) => setDepartmentDraft(event.target.value)}
          placeholder="Department"
          className="w-40"
        />
        <Input
          value={locationDraft}
          onChange={(event) => setLocationDraft(event.target.value)}
          placeholder="Location"
          className="w-40"
        />
        <Select
          value={employmentType || 'ALL'}
          onValueChange={(value) => updateFilter('employmentType', value === 'ALL' ? '' : value)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Employment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All employment types</SelectItem>
            {EMPLOYMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {EMPLOYMENT_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(value) => updateFilter('status', value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Employment type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              {isHr ? <TableHead className="w-12" /> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={isHr ? 7 : 6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={isHr ? 7 : 6} className="text-center text-sm text-destructive">
                  {getApiErrorMessage(error, 'Failed to load jobs')}
                </TableCell>
              </TableRow>
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isHr ? 7 : 6} className="text-center text-sm text-muted-foreground">
                  No jobs match your filters.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow
                  key={job._id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/jobs/${job._id}`)}
                >
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell className="text-muted-foreground">{job.department}</TableCell>
                  <TableCell className="text-muted-foreground">{job.location}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{EMPLOYMENT_TYPE_LABELS[job.employmentType]}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {getJobStatusBadges(job).map((badge) => (
                        <Badge key={badge.key} variant={badge.variant}>
                          {badge.label}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatCreatedAt(job.createdAt)}</TableCell>
                  {isHr ? (
                    <TableCell>
                      <JobRowActions job={job} />
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {meta.total} job{meta.total === 1 ? '' : 's'} · Page {meta.page} of {Math.max(meta.totalPages, 1)}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPrevPage}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage}
              onClick={() => goToPage(page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
