import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/contact'
import { Badge } from '@/components/ui/badge'
import { ApplicationForm } from '@/components/career/application-form'
import { getPublicJobBySlug } from '@/lib/career-api'
import { formatEmploymentType, formatExperienceRange } from '@/lib/career-format'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const job = await getPublicJobBySlug(slug)

  if (!job) {
    return { title: 'Position Not Found' }
  }

  const excerpt = job.description ? stripHtml(job.description).slice(0, 155) : undefined

  return {
    title: `${job.title} — Rudraas Dynamics Careers`,
    description: excerpt ?? `Apply for ${job.title} at Rudraas Dynamics, ${job.department}, ${job.location}.`,
  }
}

export default async function CareerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const job = await getPublicJobBySlug(slug)

  if (!job) {
    notFound()
  }

  const datePosted = job.openingDate ?? job.createdAt
  const locality = job.location.split(',')[0]?.trim() || job.location

  const jobPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description ?? job.title,
    datePosted,
    ...(job.closingDate ? { validThrough: job.closingDate } : {}),
    employmentType: job.employmentType,
    industry: 'Defence Technology',
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Rudraas Dynamics',
      sameAs: 'https://rudraas.com',
      logo: 'https://rudraas.com/images/rudraas-emblem.png',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: locality,
        addressCountry: 'IN',
      },
    },
    ...(job.budget
      ? {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: 'INR',
            value: { '@type': 'QuantitativeValue', value: job.budget },
          },
        }
      : {}),
  }

  return (
    <main className="bg-[#050912] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />
      <Header />

      <style>{`
        .job-prose h1, .job-prose h2, .job-prose h3, .job-prose h4 {
          font-family: var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif;
          color: #F2EFE6;
          font-weight: 500;
          margin-top: 1.5em;
          margin-bottom: 0.6em;
          line-height: 1.3;
        }
        .job-prose h1 { font-size: 1.5rem; }
        .job-prose h2 { font-size: 1.25rem; }
        .job-prose h3 { font-size: 1.1rem; }
        .job-prose p { margin-bottom: 1em; line-height: 1.75; color: #D5D6D8; font-weight: 300; }
        .job-prose ul, .job-prose ol { margin: 0.5em 0 1.25em; padding-left: 1.5em; color: #D5D6D8; font-weight: 300; }
        .job-prose ul { list-style-type: disc; }
        .job-prose ol { list-style-type: decimal; }
        .job-prose li { margin-bottom: 0.5em; line-height: 1.7; }
        .job-prose a { color: #F2EFE6; text-decoration: underline; text-underline-offset: 2px; }
        .job-prose strong, .job-prose b { color: #F2EFE6; font-weight: 500; }
        .job-prose:first-child { margin-top: 0; }
      `}</style>

      <section className="relative pt-40 pb-16 bg-[#050912]">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-8 block rd-enter-1">
            // OPEN POSITION — {job.department}
          </span>

          <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl md:text-4xl lg:text-5xl font-medium text-[#F2EFE6] mb-8 leading-tight rd-enter-2">
            {job.title}
          </h1>

          <div className="flex flex-wrap gap-3 mb-8 rd-enter-3">
            {job.isUrgent && (
              <Badge className="border-transparent bg-[#D5D6D8] text-[#050912] font-mono text-[10px] tracking-widest uppercase">
                Urgent
              </Badge>
            )}
            <Badge variant="outline" className="border-[#2a3344] text-[#D5D6D8] font-mono text-[10px] tracking-wider uppercase">
              {job.department}
            </Badge>
            <Badge variant="outline" className="border-[#2a3344] text-[#D5D6D8] font-mono text-[10px] tracking-wider uppercase">
              {job.location}
            </Badge>
            <Badge variant="outline" className="border-[#2a3344] text-[#D5D6D8] font-mono text-[10px] tracking-wider uppercase">
              {formatEmploymentType(job.employmentType)}
            </Badge>
            <Badge variant="outline" className="border-[#2a3344] text-[#D5D6D8] font-mono text-[10px] tracking-wider uppercase">
              {formatExperienceRange(job.experience.minYears, job.experience.maxYears)} experience
            </Badge>
            {job.budget && (
              <Badge variant="outline" className="border-[#2a3344] text-[#D5D6D8] font-mono text-[10px] tracking-wider uppercase">
                {job.budget}
              </Badge>
            )}
          </div>

          {job.skills.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-10 rd-enter-4">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 border border-[#2a3344] text-[#D5D6D8] font-mono text-xs tracking-wider hover:border-[#D5D6D8] transition-colors cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          <a
            href="#apply"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-[#F2EFE6] text-[#050912] text-sm tracking-widest uppercase font-medium hover:bg-[#D5D6D8] transition-colors duration-200 rd-enter-5"
          >
            APPLY NOW
            <span className="transition-transform group-hover:translate-y-1">↓</span>
          </a>
        </div>
      </section>

      <section className="relative pb-24 bg-[#050912]">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          {job.description && (
            <div className="mb-12">
              <h2 className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-4">
                // ABOUT THE ROLE
              </h2>
              <div className="job-prose" dangerouslySetInnerHTML={{ __html: job.description }} />
            </div>
          )}

          {job.responsibilities && (
            <div className="mb-12">
              <h2 className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-4">
                // RESPONSIBILITIES
              </h2>
              <div className="job-prose" dangerouslySetInnerHTML={{ __html: job.responsibilities }} />
            </div>
          )}

          {job.requirements && (
            <div className="mb-12">
              <h2 className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-4">
                // REQUIREMENTS
              </h2>
              <div className="job-prose" dangerouslySetInnerHTML={{ __html: job.requirements }} />
            </div>
          )}

          {job.jdAttachment && (
            <div className="mb-16">
              <h2 className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-4">
                // JOB DESCRIPTION
              </h2>
              <a
                href={job.jdAttachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 border border-[#2a3344] text-[#D5D6D8] font-mono text-xs tracking-wider uppercase hover:border-[#D5D6D8] hover:text-[#F2EFE6] transition-colors"
              >
                Download {job.jdAttachment.fileName} ↓
              </a>
            </div>
          )}

          <div className="mb-8">
            <Link
              href="/career"
              className="font-mono text-xs tracking-widest uppercase text-[#6A6E78] hover:text-[#D5D6D8] underline underline-offset-4"
            >
              ← Back to all open positions
            </Link>
          </div>
        </div>
      </section>

      <section id="apply" className="relative pb-32 bg-[#050912] scroll-mt-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-8 block">
            // APPLY
          </span>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl md:text-3xl font-medium text-[#F2EFE6] mb-10 leading-tight">
            Apply for {job.title}
          </h2>
          <ApplicationForm jobId={job._id} jobTitle={job.title} />
        </div>
      </section>

      <Footer />
    </main>
  )
}
