'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { submitApplication, ApplicationSubmitError } from '@/lib/career-application'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const applicationSchema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  mobile: z
    .string()
    .min(10, 'Enter a valid mobile number')
    .regex(/^[+]?[0-9\s-]{10,15}$/, 'Enter a valid mobile number'),
  linkedin: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  portfolio: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  currentCompany: z.string().optional(),
  designation: z.string().optional(),
  experienceYears: z.coerce
    .number({ message: 'Enter years of experience' })
    .min(0, 'Cannot be negative')
    .max(60, 'Enter a realistic number of years'),
  qualification: z.string().min(2, 'Enter your highest qualification'),
  currentCtc: z.string().optional(),
  expectedCtc: z.string().min(1, 'Enter your expected CTC'),
  noticePeriod: z.string().min(1, 'Enter your notice period'),
  currentLocation: z.string().min(1, 'Enter your current location'),
  preferredLocation: z.string().min(1, 'Enter your preferred location'),
  introduction: z.string().max(2000, 'Keep this under 2000 characters').optional().or(z.literal('')),
  consentGiven: z.boolean().refine((value) => value === true, {
    message: 'You must consent to data processing to apply',
  }),
  resume: z
    .custom<FileList>((value) => value instanceof FileList && value.length > 0, {
      message: 'Attach your resume',
    })
    .refine((files) => (files?.[0]?.size ?? 0) <= MAX_FILE_SIZE, 'Resume must be 10MB or smaller')
    .refine((files) => {
      const file = files?.[0]
      if (!file) return false
      return ACCEPTED_RESUME_TYPES.includes(file.type) || /\.(pdf|docx?|DOC|DOCX)$/i.test(file.name)
    }, 'Resume must be a PDF, DOC, or DOCX file'),
})

type ApplicationFormValues = z.infer<typeof applicationSchema>

export function ApplicationForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
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
      consentGiven: false,
    },
  })

  const onSubmit = async (values: ApplicationFormValues) => {
    setFormError(null)
    setSubmitting(true)
    try {
      await submitApplication({
        openingId: jobId,
        name: values.name,
        email: values.email,
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
        introduction: values.introduction || undefined,
        consentGiven: values.consentGiven,
        resume: values.resume[0],
      })
      setSubmitted(true)
    } catch (err) {
      if (err instanceof ApplicationSubmitError && err.statusCode === 409) {
        form.setError('email', { type: 'manual', message: err.message })
      } else if (err instanceof ApplicationSubmitError) {
        setFormError(err.message)
      } else {
        setFormError('Something went wrong submitting your application. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="border border-[#2a3344] bg-[#0a1019] p-12 text-center">
        <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-6 block">
          // APPLICATION RECEIVED
        </span>
        <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-medium text-[#F2EFE6] mb-4">
          Application received — we&apos;ll be in touch.
        </h3>
        <p className="text-[#D5D6D8] font-light max-w-md mx-auto leading-relaxed">
          Thank you for applying to {jobTitle}. Our team reviews every submission and will reach out if there is a fit.
        </p>
      </div>
    )
  }

  const labelClass = 'font-mono text-[10px] tracking-[0.2em] text-[#6A6E78] uppercase'
  const inputClass = 'bg-transparent border-[#2a3344] text-[#F2EFE6] placeholder:text-[#6A6E78]'

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="border border-[#2a3344] bg-[#0a1019] p-6 md:p-10 flex flex-col gap-8"
      >
        {formError && (
          <div className="border border-[#D5D6D8]/40 bg-[#1a2233] px-4 py-3 text-sm text-[#F2EFE6]">
            {formError}
          </div>
        )}

        <div>
          <h4 className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-4">// CONTACT</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Full Name *</FormLabel>
                  <FormControl>
                    <Input {...field} className={inputClass} />
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
                  <FormLabel className={labelClass}>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} className={inputClass} />
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
                  <FormLabel className={labelClass}>Mobile Number *</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} className={inputClass} />
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
                  <FormLabel className={labelClass}>LinkedIn URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://linkedin.com/in/..." className={inputClass} />
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
                  <FormLabel className={labelClass}>Portfolio / GitHub URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://..." className={inputClass} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div>
          <h4 className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-4">// PROFESSIONAL BACKGROUND</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="currentCompany"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Current Company</FormLabel>
                  <FormControl>
                    <Input {...field} className={inputClass} />
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
                  <FormLabel className={labelClass}>Current Designation</FormLabel>
                  <FormControl>
                    <Input {...field} className={inputClass} />
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
                  <FormLabel className={labelClass}>Years of Experience *</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} max={60} step="0.5" {...field} className={inputClass} />
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
                  <FormLabel className={labelClass}>Highest Qualification *</FormLabel>
                  <FormControl>
                    <Input {...field} className={inputClass} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div>
          <h4 className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-4">// COMPENSATION &amp; AVAILABILITY</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="currentCtc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Current CTC</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 18 LPA" className={inputClass} />
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
                  <FormLabel className={labelClass}>Expected CTC *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 24 LPA" className={inputClass} />
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
                  <FormLabel className={labelClass}>Notice Period *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 30 days" className={inputClass} />
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
                  <FormLabel className={labelClass}>Current Location *</FormLabel>
                  <FormControl>
                    <Input {...field} className={inputClass} />
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
                  <FormLabel className={labelClass}>Preferred Location *</FormLabel>
                  <FormControl>
                    <Input {...field} className={inputClass} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div>
          <h4 className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-4">// INTRODUCTION</h4>
          <FormField
            control={form.control}
            name="introduction"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Tell us why you are a fit (optional)</FormLabel>
                <FormControl>
                  <Textarea rows={5} maxLength={2000} {...field} className={inputClass} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <h4 className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-4">// RESUME</h4>
          <FormField
            control={form.control}
            name="resume"
            render={({ field: { onChange, onBlur, name, ref } }) => (
              <FormItem>
                <FormLabel className={labelClass}>Upload Resume — PDF, DOC or DOCX, max 10MB *</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    name={name}
                    ref={ref}
                    onBlur={onBlur}
                    onChange={(e) => onChange(e.target.files)}
                    className={cn(inputClass, 'cursor-pointer')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="consentGiven"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-[#2a3344] mt-0.5"
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal text-[#D5D6D8] normal-case tracking-normal">
                  I consent to Rudraas Dynamics processing my personal data for recruitment purposes. *
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={submitting}
          className="self-start bg-[#F2EFE6] text-[#050912] hover:bg-[#D5D6D8] font-medium tracking-widest uppercase text-sm px-8 py-6 disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </form>
    </Form>
  )
}
