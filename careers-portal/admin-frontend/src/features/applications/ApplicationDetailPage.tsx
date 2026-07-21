import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Download, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { getApiErrorMessage } from '@/lib/api-client'
import { downloadBlob } from '@/lib/download-blob'
import { usePageTitle } from '@/components/layout/page-header-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/features/auth/auth-context'
import {
  addApplicationNote,
  applicationDetailQueryKey,
  applicationsQueryKey,
  deleteApplication,
  downloadResume,
  getApplication,
  updateApplication,
  updateApplicationStatus,
} from '@/features/applications/applications-api'
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUSES,
  CANDIDATE_SOURCE_LABELS,
  type ApplicationStatus,
  type Candidate,
  type UpdateApplicationPayload,
} from '@/features/applications/types'

const editApplicationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().min(1, 'Mobile is required'),
  linkedin: z.string().optional(),
  portfolio: z.string().optional(),
  currentCompany: z.string().optional(),
  designation: z.string().optional(),
  experienceYears: z.coerce.number().min(0, 'Must be 0 or more'),
  qualification: z.string().min(1, 'Qualification is required'),
  currentCtc: z.string().optional(),
  expectedCtc: z.string().min(1, 'Expected CTC is required'),
  noticePeriod: z.string().min(1, 'Notice period is required'),
  currentLocation: z.string().min(1, 'Current location is required'),
  preferredLocation: z.string().min(1, 'Preferred location is required'),
})

type EditApplicationFormValues = z.infer<typeof editApplicationSchema>

function formatDateTime(value: string): string {
  try {
    return format(new Date(value), 'MMM d, yyyy p')
  } catch {
    return '—'
  }
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  )
}

function EditDetailsDialog({
  candidate,
  open,
  onOpenChange,
}: {
  candidate: Candidate
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()

  const form = useForm<EditApplicationFormValues>({
    resolver: zodResolver(editApplicationSchema),
    defaultValues: {
      name: candidate.name,
      mobile: candidate.mobile,
      linkedin: candidate.linkedin ?? '',
      portfolio: candidate.portfolio ?? '',
      currentCompany: candidate.currentCompany ?? '',
      designation: candidate.designation ?? '',
      experienceYears: candidate.experienceYears,
      qualification: candidate.qualification,
      currentCtc: candidate.currentCtc ?? '',
      expectedCtc: candidate.expectedCtc,
      noticePeriod: candidate.noticePeriod,
      currentLocation: candidate.currentLocation,
      preferredLocation: candidate.preferredLocation,
    },
  })

  useEffect(() => {
    form.reset({
      name: candidate.name,
      mobile: candidate.mobile,
      linkedin: candidate.linkedin ?? '',
      portfolio: candidate.portfolio ?? '',
      currentCompany: candidate.currentCompany ?? '',
      designation: candidate.designation ?? '',
      experienceYears: candidate.experienceYears,
      qualification: candidate.qualification,
      currentCtc: candidate.currentCtc ?? '',
      expectedCtc: candidate.expectedCtc,
      noticePeriod: candidate.noticePeriod,
      currentLocation: candidate.currentLocation,
      preferredLocation: candidate.preferredLocation,
    })
  }, [candidate, form])

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateApplicationPayload) => updateApplication(candidate._id, payload),
    onSuccess: async () => {
      toast.success('Application updated')
      await queryClient.invalidateQueries({ queryKey: applicationDetailQueryKey(candidate._id) })
      await queryClient.invalidateQueries({ queryKey: applicationsQueryKey })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update application'))
    },
  })

  function onSubmit(values: EditApplicationFormValues) {
    updateMutation.mutate({
      name: values.name,
      mobile: values.mobile,
      linkedin: values.linkedin || undefined,
      portfolio: values.portfolio || undefined,
      currentCompany: values.currentCompany || undefined,
      designation: values.designation || undefined,
      experienceYears: values.experienceYears,
      qualification: values.qualification,
      currentCtc: values.currentCtc || undefined,
      expectedCtc: values.expectedCtc,
      noticePeriod: values.noticePeriod,
      currentLocation: values.currentLocation,
      preferredLocation: values.preferredLocation,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit candidate details</DialogTitle>
          <DialogDescription>Update editable profile fields for {candidate.name}.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="portfolio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentCompany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current company (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="experienceYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience (years)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={0.5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="qualification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualification</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentCtc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current CTC (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expectedCtc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected CTC</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="noticePeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notice period</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferredLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  usePageTitle('Application Details')

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [nextStatus, setNextStatus] = useState<ApplicationStatus | null>(null)
  const [statusRemark, setStatusRemark] = useState('')
  const [noteDraft, setNoteDraft] = useState('')

  const applicationQuery = useQuery({
    queryKey: applicationDetailQueryKey(id as string),
    queryFn: () => getApplication(id as string),
    enabled: Boolean(id),
  })

  const candidate = applicationQuery.data?.data

  const statusMutation = useMutation({
    mutationFn: () =>
      updateApplicationStatus(
        id as string,
        (nextStatus ?? candidate?.status) as ApplicationStatus,
        statusRemark || undefined,
      ),
    onSuccess: async () => {
      toast.success('Status updated')
      await queryClient.invalidateQueries({ queryKey: applicationDetailQueryKey(id as string) })
      await queryClient.invalidateQueries({ queryKey: applicationsQueryKey })
      setStatusRemark('')
      setNextStatus(null)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update status'))
    },
  })

  const noteMutation = useMutation({
    mutationFn: () => addApplicationNote(id as string, noteDraft.trim()),
    onSuccess: async () => {
      toast.success('Note added')
      await queryClient.invalidateQueries({ queryKey: applicationDetailQueryKey(id as string) })
      setNoteDraft('')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to add note'))
    },
  })

  const downloadResumeMutation = useMutation({
    mutationFn: () => downloadResume(id as string),
    onSuccess: (blob) => {
      downloadBlob(blob, candidate?.resumeFileName ?? 'resume')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to download resume'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteApplication(id as string),
    onSuccess: async () => {
      toast.success('Application deleted')
      await queryClient.invalidateQueries({ queryKey: applicationsQueryKey })
      navigate('/applications')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete application'))
    },
  })

  if (applicationQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (applicationQuery.isError || !candidate) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-destructive">
          {getApiErrorMessage(applicationQuery.error, 'Failed to load application')}
        </CardContent>
      </Card>
    )
  }

  const displayedStatus = nextStatus ?? candidate.status
  const sortedHistory = [...candidate.statusHistory].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
  )
  const sortedNotes = [...candidate.internalNotes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  const sortedActivity = [...candidate.activityLog].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{candidate.name}</CardTitle>
            <CardDescription>
              {candidate.email} · {candidate.mobile}
            </CardDescription>
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              {candidate.linkedin ? (
                <a
                  href={candidate.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  LinkedIn
                </a>
              ) : null}
              {candidate.portfolio ? (
                <a
                  href={candidate.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Portfolio
                </a>
              ) : null}
            </div>
            <Link
              to={`/jobs/${candidate.opening._id}`}
              className="mt-2 inline-block text-sm text-muted-foreground hover:underline"
            >
              Applied for {candidate.opening.title} · {candidate.opening.department}
            </Link>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Badge variant="secondary">{APPLICATION_STATUS_LABELS[candidate.status]}</Badge>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadResumeMutation.mutate()}
                disabled={downloadResumeMutation.isPending}
              >
                {downloadResumeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download resume
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                Edit details
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <EditDetailsDialog candidate={candidate} open={isEditOpen} onOpenChange={setIsEditOpen} />

      <Card>
        <CardHeader>
          <CardTitle>Pipeline status</CardTitle>
          <CardDescription>Move the candidate to the next stage and optionally leave a remark.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={displayedStatus} onValueChange={(value) => setNextStatus(value as ApplicationStatus)}>
            <SelectTrigger className="w-64">
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
            value={statusRemark}
            onChange={(event) => setStatusRemark(event.target.value)}
          />
          <div className="flex justify-end">
            <Button onClick={() => statusMutation.mutate()} disabled={statusMutation.isPending}>
              {statusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Update status
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="history">Status history</TabsTrigger>
          <TabsTrigger value="notes">Internal notes</TabsTrigger>
          <TabsTrigger value="activity">Activity log</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailRow label="Experience" value={`${candidate.experienceYears} years`} />
                <DetailRow label="Qualification" value={candidate.qualification} />
                <DetailRow label="Current company" value={candidate.currentCompany ?? '—'} />
                <DetailRow label="Designation" value={candidate.designation ?? '—'} />
                <DetailRow label="Current CTC" value={candidate.currentCtc ?? '—'} />
                <DetailRow label="Expected CTC" value={candidate.expectedCtc} />
                <DetailRow label="Notice period" value={candidate.noticePeriod} />
                <DetailRow label="Current location" value={candidate.currentLocation} />
                <DetailRow label="Preferred location" value={candidate.preferredLocation} />
                <DetailRow
                  label="Source"
                  value={
                    candidate.sourceDetail
                      ? `${CANDIDATE_SOURCE_LABELS[candidate.source]} — ${candidate.sourceDetail}`
                      : CANDIDATE_SOURCE_LABELS[candidate.source]
                  }
                />
                <DetailRow label="Consent given" value={candidate.consentGiven ? 'Yes' : 'No'} />
                <DetailRow label="Applied on" value={formatDateTime(candidate.createdAt)} />
              </div>
              {candidate.introduction ? (
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Introduction</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{candidate.introduction}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="space-y-4 pt-6">
              {sortedHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No status changes recorded.</p>
              ) : (
                sortedHistory.map((entry) => (
                  <div
                    key={entry._id}
                    className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <Badge variant="secondary">{APPLICATION_STATUS_LABELS[entry.status]}</Badge>
                      {entry.remark ? <p className="mt-1 text-sm">{entry.remark}</p> : null}
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{entry.changedBy?.name ?? 'System'}</p>
                      <p>{formatDateTime(entry.changedAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-3">
                {sortedNotes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No notes yet.</p>
                ) : (
                  sortedNotes.map((note) => (
                    <div key={note._id} className="rounded-md border border-border p-3">
                      <p className="text-sm">{note.note}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {note.addedBy.name} · {formatDateTime(note.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="space-y-2 border-t border-border pt-4">
                <Textarea
                  placeholder="Add an internal note…"
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => noteMutation.mutate()}
                    disabled={noteMutation.isPending || noteDraft.trim().length === 0}
                  >
                    {noteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Add note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardContent className="space-y-3 pt-6">
              {sortedActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity recorded.</p>
              ) : (
                sortedActivity.map((entry) => (
                  <div
                    key={entry._id}
                    className="flex items-center justify-between border-b border-border pb-2 text-sm last:border-0 last:pb-0"
                  >
                    <span>
                      {entry.action}
                      {entry.performedBy ? ` — ${entry.performedBy.name}` : ''}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDateTime(entry.createdAt)}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isAdmin ? (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger zone</CardTitle>
            <CardDescription>Permanently delete this application record.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
              Delete application
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete application?</DialogTitle>
            <DialogDescription>
              This permanently removes {candidate.name}'s application. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
