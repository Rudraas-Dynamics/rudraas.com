import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight, Download, FileDown, Loader2, Plus } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api-client'
import { downloadBlob } from '@/lib/download-blob'
import { usePageTitle } from '@/components/layout/page-header-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Textarea } from '@/components/ui/textarea'
import {
  applicationsListQueryKey,
  applicationsQueryKey,
  bulkDownloadResumes,
  bulkUpdateStatus,
  exportApplications,
  listApplications,
} from '@/features/applications/applications-api'
import { ManualApplicationForm } from '@/features/applications/ManualApplicationForm'
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUSES,
  CANDIDATE_SOURCE_LABELS,
  CANDIDATE_SOURCES,
  type ApplicationExportQuery,
  type ApplicationListQuery,
  type ApplicationStatus,
  type CandidateSource,
} from '@/features/applications/types'
import { jobsListQueryKey, listJobs } from '@/features/jobs/jobs-api'

const PAGE_LIMIT = 20

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

function formatDate(value: string): string {
  try {
    return format(new Date(value), 'MMM d, yyyy')
  } catch {
    return '—'
  }
}

function BulkStatusDialog({
  ids,
  open,
  onOpenChange,
  onSuccess,
}: {
  ids: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [status, setStatus] = useState<ApplicationStatus>('SCREENING')
  const [remark, setRemark] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => bulkUpdateStatus({ ids, status, remark: remark || undefined }),
    onSuccess: async () => {
      toast.success(`Updated ${ids.length} application${ids.length === 1 ? '' : 's'}`)
      await queryClient.invalidateQueries({ queryKey: applicationsQueryKey })
      onOpenChange(false)
      setRemark('')
      onSuccess()
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update applications'))
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Update status for {ids.length} application{ids.length === 1 ? '' : 's'}
          </DialogTitle>
          <DialogDescription>
            This overwrites the current pipeline status for every selected candidate.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={status} onValueChange={(value) => setStatus(value as ApplicationStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APPLICATION_STATUSES.map((option) => (
                <SelectItem key={option} value={option}>
                  {APPLICATION_STATUS_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Remark (optional)"
            value={remark}
            onChange={(event) => setRemark(event.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Update status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ApplicationsListPage() {
  usePageTitle('Applications')
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isBulkStatusOpen, setIsBulkStatusOpen] = useState(false)

  const page = Number(searchParams.get('page') ?? '1') || 1
  const opening = searchParams.get('opening') ?? ''
  const status = (searchParams.get('status') ?? 'ALL') as ApplicationStatus | 'ALL'
  const source = (searchParams.get('source') ?? 'ALL') as CandidateSource | 'ALL'
  const search = searchParams.get('search') ?? ''
  const currentLocation = searchParams.get('currentLocation') ?? ''
  const experienceMin = searchParams.get('experienceMin') ?? ''
  const experienceMax = searchParams.get('experienceMax') ?? ''
  const dateFrom = searchParams.get('dateFrom') ?? ''
  const dateTo = searchParams.get('dateTo') ?? ''

  const [searchDraft, setSearchDraft] = useDebouncedFilter(searchParams, setSearchParams, 'search')
  const [locationDraft, setLocationDraft] = useDebouncedFilter(searchParams, setSearchParams, 'currentLocation')
  const [expMinDraft, setExpMinDraft] = useDebouncedFilter(searchParams, setSearchParams, 'experienceMin')
  const [expMaxDraft, setExpMaxDraft] = useDebouncedFilter(searchParams, setSearchParams, 'experienceMax')

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

  const jobsQuery = useQuery({
    queryKey: jobsListQueryKey({ limit: 100, sortBy: 'title', sortOrder: 'asc' }),
    queryFn: () => listJobs({ limit: 100, sortBy: 'title', sortOrder: 'asc' }),
  })
  const jobs = jobsQuery.data?.data ?? []

  const query: ApplicationListQuery = useMemo(
    () => ({
      page,
      limit: PAGE_LIMIT,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      search: search || undefined,
      opening: opening || undefined,
      status: status !== 'ALL' ? status : undefined,
      source: source !== 'ALL' ? source : undefined,
      currentLocation: currentLocation || undefined,
      experienceMin: experienceMin ? Number(experienceMin) : undefined,
      experienceMax: experienceMax ? Number(experienceMax) : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    [page, search, opening, status, source, currentLocation, experienceMin, experienceMax, dateFrom, dateTo],
  )

  const exportQuery: ApplicationExportQuery = useMemo(
    () => ({
      opening: opening || undefined,
      status: status !== 'ALL' ? status : undefined,
      source: source !== 'ALL' ? source : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      experienceMin: experienceMin ? Number(experienceMin) : undefined,
      experienceMax: experienceMax ? Number(experienceMax) : undefined,
    }),
    [opening, status, source, dateFrom, dateTo, experienceMin, experienceMax],
  )

  const { data, isLoading, isError, error } = useQuery({
    queryKey: applicationsListQueryKey(query),
    queryFn: () => listApplications(query),
    placeholderData: (previous) => previous,
  })

  const applications = data?.data ?? []
  const meta = data?.meta

  useEffect(() => {
    setSelectedIds(new Set())
  }, [query])

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function toggleSelectAll(checked: boolean) {
    setSelectedIds(checked ? new Set(applications.map((candidate) => candidate._id)) : new Set())
  }

  const exportMutation = useMutation({
    mutationFn: () => exportApplications(exportQuery),
    onSuccess: (blob) => downloadBlob(blob, 'applications-export.xlsx'),
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to export applications')),
  })

  const downloadZipMutation = useMutation({
    mutationFn: (ids: string[]) => bulkDownloadResumes(ids),
    onSuccess: (blob) => downloadBlob(blob, 'candidate-resumes.zip'),
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to download resumes')),
  })

  const allSelectedOnPage = applications.length > 0 && applications.every((candidate) => selectedIds.has(candidate._id))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold">Applications</h2>
          <p className="text-sm text-muted-foreground">
            Review candidate applications, statuses, and hiring pipeline activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            Export Excel
          </Button>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add candidate
          </Button>
        </div>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add candidate</DialogTitle>
            <DialogDescription>Manually record a candidate application for an opening.</DialogDescription>
          </DialogHeader>
          <ManualApplicationForm onSuccess={() => setIsAddOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
          placeholder="Search name or email…"
          className="w-56"
        />
        <Select value={opening || 'ALL'} onValueChange={(value) => updateFilter('opening', value === 'ALL' ? '' : value)}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Job" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All jobs</SelectItem>
            {jobs.map((job) => (
              <SelectItem key={job._id} value={job._id}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(value) => updateFilter('status', value === 'ALL' ? '' : value)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {APPLICATION_STATUSES.map((option) => (
              <SelectItem key={option} value={option}>
                {APPLICATION_STATUS_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={source} onValueChange={(value) => updateFilter('source', value === 'ALL' ? '' : value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All sources</SelectItem>
            {CANDIDATE_SOURCES.map((option) => (
              <SelectItem key={option} value={option}>
                {CANDIDATE_SOURCE_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={locationDraft}
          onChange={(event) => setLocationDraft(event.target.value)}
          placeholder="Current location"
          className="w-40"
        />
        <Input
          value={expMinDraft}
          onChange={(event) => setExpMinDraft(event.target.value)}
          placeholder="Min exp (yrs)"
          type="number"
          min={0}
          className="w-28"
        />
        <Input
          value={expMaxDraft}
          onChange={(event) => setExpMaxDraft(event.target.value)}
          placeholder="Max exp (yrs)"
          type="number"
          min={0}
          className="w-28"
        />
        <Input
          value={dateFrom}
          onChange={(event) => updateFilter('dateFrom', event.target.value)}
          type="date"
          className="w-40"
          aria-label="Applied from"
        />
        <Input
          value={dateTo}
          onChange={(event) => updateFilter('dateTo', event.target.value)}
          type="date"
          className="w-40"
          aria-label="Applied to"
        />
      </div>

      {selectedIds.size > 0 ? (
        <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2">
          <span className="text-sm">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsBulkStatusOpen(true)}>
              Update status
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadZipMutation.mutate(Array.from(selectedIds))}
              disabled={downloadZipMutation.isPending}
            >
              {downloadZipMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download resumes (.zip)
            </Button>
          </div>
        </div>
      ) : null}

      <BulkStatusDialog
        ids={Array.from(selectedIds)}
        open={isBulkStatusOpen}
        onOpenChange={setIsBulkStatusOpen}
        onSuccess={() => setSelectedIds(new Set())}
      />

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelectedOnPage}
                  onCheckedChange={(checked) => toggleSelectAll(checked === true)}
                  aria-label="Select all applications on this page"
                />
              </TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Applied</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-destructive">
                  {getApiErrorMessage(error, 'Failed to load applications')}
                </TableCell>
              </TableRow>
            ) : applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                  No applications match your filters.
                </TableCell>
              </TableRow>
            ) : (
              applications.map((candidate) => (
                <TableRow
                  key={candidate._id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/applications/${candidate._id}`)}
                >
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(candidate._id)}
                      onCheckedChange={(checked) => toggleSelected(candidate._id, checked === true)}
                      aria-label={`Select ${candidate.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{candidate.name}</div>
                    <div className="text-xs text-muted-foreground">{candidate.email}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{candidate.opening.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{APPLICATION_STATUS_LABELS[candidate.status]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{CANDIDATE_SOURCE_LABELS[candidate.source]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{candidate.experienceYears} yrs</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(candidate.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {meta.total} application{meta.total === 1 ? '' : 's'} · Page {meta.page} of{' '}
            {Math.max(meta.totalPages, 1)}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={!meta.hasPrevPage} onClick={() => goToPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={!meta.hasNextPage} onClick={() => goToPage(page + 1)}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
