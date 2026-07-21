import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { getApiErrorMessage } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogFooter } from '@/components/ui/dialog'
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
import { Textarea } from '@/components/ui/textarea'
import { applicationsQueryKey, createManualApplication } from '@/features/applications/applications-api'
import { CANDIDATE_SOURCE_LABELS, CANDIDATE_SOURCES } from '@/features/applications/types'
import { jobsListQueryKey, listJobs } from '@/features/jobs/jobs-api'

const manualApplicationSchema = z.object({
  openingId: z.string().min(1, 'Select a job'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email address'),
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
  introduction: z.string().optional(),
  source: z.enum([
    'WEBSITE',
    'LINKEDIN',
    'NAUKRI',
    'REFERRAL',
    'CAMPUS',
    'WALK_IN',
    'RECRUITER',
    'CONSULTANCY',
    'OTHER',
  ]),
  sourceDetail: z.string().optional(),
  consentGiven: z.literal(true, { errorMap: () => ({ message: 'Candidate consent is required' }) }),
  resume: z.instanceof(File, { message: 'Resume is required' }),
})

type ManualApplicationFormValues = z.infer<typeof manualApplicationSchema>

const defaultValues: Partial<ManualApplicationFormValues> = {
  openingId: '',
  name: '',
  email: '',
  mobile: '',
  linkedin: '',
  portfolio: '',
  currentCompany: '',
  designation: '',
  experienceYears: 0,
  qualification: '',
  currentCtc: '',
  expectedCtc: '',
  noticePeriod: '',
  currentLocation: '',
  preferredLocation: '',
  introduction: '',
  sourceDetail: '',
}

interface ManualApplicationFormProps {
  onSuccess: () => void
}

export function ManualApplicationForm({ onSuccess }: ManualApplicationFormProps) {
  const queryClient = useQueryClient()

  const jobsQuery = useQuery({
    queryKey: jobsListQueryKey({ limit: 100, sortBy: 'title', sortOrder: 'asc' }),
    queryFn: () => listJobs({ limit: 100, sortBy: 'title', sortOrder: 'asc' }),
  })

  const jobs = jobsQuery.data?.data ?? []

  const form = useForm<ManualApplicationFormValues>({
    resolver: zodResolver(manualApplicationSchema),
    defaultValues: defaultValues as ManualApplicationFormValues,
  })

  const createMutation = useMutation({
    mutationFn: createManualApplication,
    onSuccess: async () => {
      toast.success('Candidate added')
      await queryClient.invalidateQueries({ queryKey: applicationsQueryKey })
      form.reset(defaultValues as ManualApplicationFormValues)
      onSuccess()
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to add candidate'))
    },
  })

  function onSubmit(values: ManualApplicationFormValues) {
    createMutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="openingId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job._id} value={job._id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
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
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CANDIDATE_SOURCES.map((source) => (
                      <SelectItem key={source} value={source}>
                        {CANDIDATE_SOURCE_LABELS[source]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sourceDetail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source detail (optional)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="introduction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Introduction (optional)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resume</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  name={field.name}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  onChange={(event) => field.onChange(event.target.files?.[0])}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consentGiven"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mt-0">Candidate has given consent to process this application</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Add candidate
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
