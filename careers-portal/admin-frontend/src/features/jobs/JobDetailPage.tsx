import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { getApiErrorMessage } from '@/lib/api-client'
import { usePageTitle } from '@/components/layout/page-header-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useAuth } from '@/features/auth/auth-context'
import { DeleteJobDialog } from '@/features/jobs/DeleteJobDialog'
import { getJobStatusBadges } from '@/features/jobs/job-status'
import {
  createJob,
  getJob,
  jobDetailQueryKey,
  jobsQueryKey,
  updateJob,
  uploadJobAttachment,
} from '@/features/jobs/jobs-api'
import { RichTextField } from '@/features/jobs/RichTextField'
import { TagInput } from '@/features/jobs/TagInput'
import {
  EMPLOYMENT_TYPE_LABELS,
  EMPLOYMENT_TYPES,
  type Job,
  type JobAttachment,
  type JobPayload,
} from '@/features/jobs/types'
import { useJobActionMutations } from '@/features/jobs/use-job-actions'

const jobFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  department: z.string().min(1, 'Department is required'),
  location: z.string().min(1, 'Location is required'),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']),
  experience: z
    .object({
      minYears: z.coerce.number().min(0, 'Must be 0 or more'),
      maxYears: z.coerce.number().min(0, 'Must be 0 or more'),
    })
    .refine((value) => value.maxYears >= value.minYears, {
      message: 'Max years must be greater than or equal to min years',
      path: ['maxYears'],
    }),
  skills: z.array(z.string()).min(1, 'Add at least one skill'),
  description: z.string().min(1, 'Description is required'),
  responsibilities: z.string().min(1, 'Responsibilities is required'),
  requirements: z.string().min(1, 'Requirements is required'),
  budget: z.string().optional(),
  openingDate: z.string().optional(),
  closingDate: z.string().optional(),
})

type JobFormValues = z.infer<typeof jobFormSchema>

const emptyDefaultValues: JobFormValues = {
  title: '',
  department: '',
  location: '',
  employmentType: 'FULL_TIME',
  experience: { minYears: 0, maxYears: 0 },
  skills: [],
  description: '',
  responsibilities: '',
  requirements: '',
  budget: '',
  openingDate: '',
  closingDate: '',
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function toDateInputValue(value: string | null): string {
  if (!value) return ''
  return value.slice(0, 10)
}

function JobActionsCard({ job }: { job: Job }) {
  const navigate = useNavigate()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const { publishMutation, closeMutation, archiveMutation, urgentMutation, duplicateMutation } =
    useJobActionMutations(job)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job status</CardTitle>
        <CardDescription>Publish, close, archive, mark urgent, duplicate, or delete this requisition.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        <div className="mr-2 flex flex-wrap gap-1">
          {getJobStatusBadges(job).map((badge) => (
            <Badge key={badge.key} variant={badge.variant}>
              {badge.label}
            </Badge>
          ))}
        </div>
        {!job.isPublished && !job.isArchived ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => publishMutation.mutate()}
            disabled={publishMutation.isPending}
          >
            Publish
          </Button>
        ) : null}
        {job.isPublished && !job.isClosed && !job.isArchived ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => closeMutation.mutate()}
            disabled={closeMutation.isPending}
          >
            Close
          </Button>
        ) : null}
        {!job.isArchived ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => archiveMutation.mutate()}
            disabled={archiveMutation.isPending}
          >
            Archive
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="outline"
          onClick={() => urgentMutation.mutate()}
          disabled={urgentMutation.isPending}
        >
          {job.isUrgent ? 'Remove urgent flag' : 'Mark urgent'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => duplicateMutation.mutate()}
          disabled={duplicateMutation.isPending}
        >
          Duplicate
        </Button>
        <Button size="sm" variant="destructive" onClick={() => setIsDeleteOpen(true)}>
          Delete
        </Button>
      </CardContent>
      <DeleteJobDialog
        job={job}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onDeleted={() => navigate('/jobs')}
      />
    </Card>
  )
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === undefined
  const { user } = useAuth()
  const isHr = user?.role === 'HR'
  const isReadOnly = !isHr
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachment, setAttachment] = useState<JobAttachment | null>(null)

  usePageTitle(isNew ? 'New Job' : 'Job Details')

  const jobQuery = useQuery({
    queryKey: id ? jobDetailQueryKey(id) : ['jobs', 'new'],
    queryFn: () => getJob(id as string),
    enabled: Boolean(id),
  })

  const job = jobQuery.data?.data

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: emptyDefaultValues,
  })

  useEffect(() => {
    if (!job) return
    form.reset({
      title: job.title,
      department: job.department,
      location: job.location,
      employmentType: job.employmentType,
      experience: job.experience,
      skills: job.skills,
      description: job.description,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      budget: job.budget ?? '',
      openingDate: toDateInputValue(job.openingDate),
      closingDate: toDateInputValue(job.closingDate),
    })
    setAttachment(job.jdAttachment)
  }, [job, form])

  useEffect(() => {
    if (isNew && isReadOnly) {
      toast.error('Only HR can create job postings')
      navigate('/jobs', { replace: true })
    }
  }, [isNew, isReadOnly, navigate])

  const uploadMutation = useMutation({
    mutationFn: uploadJobAttachment,
    onSuccess: (result) => {
      setAttachment(result)
      toast.success('JD attachment uploaded')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to upload attachment'))
    },
  })

  const createMutation = useMutation({
    mutationFn: (payload: JobPayload) => createJob(payload),
    onSuccess: async (result) => {
      toast.success('Job created')
      await queryClient.invalidateQueries({ queryKey: jobsQueryKey })
      navigate(`/jobs/${result.data._id}`, { replace: true })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create job'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<JobPayload>) => updateJob(id as string, payload),
    onSuccess: async () => {
      toast.success('Job updated')
      await queryClient.invalidateQueries({ queryKey: jobsQueryKey })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update job'))
    },
  })

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    uploadMutation.mutate(file)
    event.target.value = ''
  }

  function onSubmit(values: JobFormValues) {
    const payload: JobPayload = {
      title: values.title,
      department: values.department,
      location: values.location,
      employmentType: values.employmentType,
      experience: values.experience,
      skills: values.skills,
      description: values.description,
      responsibilities: values.responsibilities,
      requirements: values.requirements,
      budget: values.budget ? values.budget : null,
      jdAttachment: attachment,
      openingDate: values.openingDate ? values.openingDate : null,
      closingDate: values.closingDate ? values.closingDate : null,
    }

    if (isNew) {
      createMutation.mutate(payload)
    } else {
      updateMutation.mutate(payload)
    }
  }

  if (isNew && isReadOnly) {
    return null
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-semibold">{isNew ? 'New job' : job?.title ?? 'Job details'}</h2>
        <p className="text-sm text-muted-foreground">
          {isNew
            ? 'Create a new job requisition.'
            : isReadOnly
              ? 'Read-only view — only HR can edit job postings.'
              : 'Edit the job requisition and manage its publication status.'}
        </p>
      </div>

      {!isNew && jobQuery.isLoading ? <Skeleton className="h-24 w-full" /> : null}

      {!isNew && jobQuery.isError ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">
            {getApiErrorMessage(jobQuery.error, 'Failed to load job')}
          </CardContent>
        </Card>
      ) : null}

      {!isNew && job ? (
        isHr ? (
          <JobActionsCard job={job} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Job status</CardTitle>
              <CardDescription>Only HR can change publication status.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1">
              {getJobStatusBadges(job).map((badge) => (
                <Badge key={badge.key} variant={badge.variant}>
                  {badge.label}
                </Badge>
              ))}
            </CardContent>
          </Card>
        )
      ) : null}

      {!isNew && job ? (
        <Link
          to={`/applications?opening=${job._id}`}
          className="inline-block text-sm text-primary underline-offset-4 hover:underline"
        >
          View applications for this opening →
        </Link>
      ) : null}

      {isNew || job ? (
        <Card>
          <CardHeader>
            <CardTitle>Job details</CardTitle>
            <CardDescription>
              {isReadOnly ? 'Viewing job details.' : 'Fields marked optional may be left blank.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Senior Backend Engineer" disabled={isReadOnly} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="Engineering" disabled={isReadOnly} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Bengaluru" disabled={isReadOnly} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment type</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange} disabled={isReadOnly}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EMPLOYMENT_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {EMPLOYMENT_TYPE_LABELS[type]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="experience.minYears"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min experience (yrs)</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} step={1} disabled={isReadOnly} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="experience.maxYears"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max experience (yrs)</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} step={1} disabled={isReadOnly} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills</FormLabel>
                      <FormControl>
                        <TagInput
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isReadOnly}
                          placeholder="Add a skill and press Enter"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <RichTextField
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isReadOnly}
                          placeholder="<p>Role overview…</p>"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responsibilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsibilities</FormLabel>
                      <FormControl>
                        <RichTextField
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isReadOnly}
                          placeholder="<ul><li>Own the payments service…</li></ul>"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirements</FormLabel>
                      <FormControl>
                        <RichTextField
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isReadOnly}
                          placeholder="<ul><li>5+ years with distributed systems…</li></ul>"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="12-18 LPA" disabled={isReadOnly} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="openingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening date (optional)</FormLabel>
                        <FormControl>
                          <Input type="date" disabled={isReadOnly} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="closingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closing date (optional)</FormLabel>
                        <FormControl>
                          <Input type="date" disabled={isReadOnly} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <FormLabel>JD attachment</FormLabel>
                  {attachment ? (
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {attachment.fileName}
                      </a>
                      <span className="text-muted-foreground">({formatBytes(attachment.sizeBytes)})</span>
                      {!isReadOnly ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadMutation.isPending}
                          >
                            Replace
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setAttachment(null)}
                          >
                            Remove
                          </Button>
                        </>
                      ) : null}
                    </div>
                  ) : !isReadOnly ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadMutation.isPending}
                    >
                      {uploadMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Upload JD file
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">No attachment.</p>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </div>

                {!isReadOnly ? (
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {isNew ? 'Create job' : 'Save changes'}
                    </Button>
                  </div>
                ) : null}
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
