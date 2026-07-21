import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/contact'
import { CareerFilters } from '@/components/career/career-filters'
import { OpeningCard } from '@/components/career/opening-card'
import { Pagination, PaginationContent, PaginationItem, PaginationEllipsis } from '@/components/ui/pagination'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getPublicJobs, getPublicJobFilters } from '@/lib/career-api'

export const metadata: Metadata = {
  title: 'Open Positions',
  description:
    'We are hiring defence engineers, operators, and intelligence specialists to build sovereign autonomy, perception, and counter-UAS systems at Rudraas Dynamics.',
}

interface CareerSearchParams {
  search?: string
  department?: string
  location?: string
  employmentType?: string
  experienceMin?: string
  experienceMax?: string
  page?: string
}

function buildPageHref(params: CareerSearchParams, page: number): string {
  const qs = new URLSearchParams()
  if (params.search) qs.set('search', params.search)
  if (params.department) qs.set('department', params.department)
  if (params.location) qs.set('location', params.location)
  if (params.employmentType) qs.set('employmentType', params.employmentType)
  if (params.experienceMin) qs.set('experienceMin', params.experienceMin)
  if (params.experienceMax) qs.set('experienceMax', params.experienceMax)
  if (page > 1) qs.set('page', String(page))
  const s = qs.toString()
  return s ? `/career?${s}` : '/career'
}

export default async function CareerPage({
  searchParams,
}: {
  searchParams: Promise<CareerSearchParams>
}) {
  const params = await searchParams
  const parsedPage = params.page ? Number(params.page) : 1
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1

  const [{ data: jobs, meta }, filters] = await Promise.all([
    getPublicJobs({
      search: params.search,
      department: params.department,
      location: params.location,
      employmentType: params.employmentType,
      experienceMin: params.experienceMin,
      experienceMax: params.experienceMax,
      page,
      limit: 12,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
    getPublicJobFilters(),
  ])

  const urgentJobs = jobs.filter((job) => job.isUrgent)

  return (
    <main className="bg-[#050912] min-h-screen">
      <Header />

      <section className="relative pt-40 pb-16 bg-[#050912]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-8 block rd-enter-1">
            // 001 — OPEN POSITIONS
          </span>
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl md:text-4xl lg:text-5xl font-medium text-[#F2EFE6] mb-6 max-w-4xl leading-tight rd-enter-2">
            Build the sovereign defence platform.
          </h1>
          <p className="text-[#D5D6D8] font-light leading-relaxed max-w-2xl rd-enter-3">
            {meta.total} open {meta.total === 1 ? 'position' : 'positions'} across autonomy, perception, embedded systems, and mission operations.
          </p>
        </div>
      </section>

      {urgentJobs.length > 0 && (
        <section className="bg-[#1a2233] border-y border-[#2a3344]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex flex-wrap items-center gap-x-8 gap-y-2">
            <span className="font-mono text-xs tracking-[0.2em] text-[#F2EFE6] uppercase shrink-0">
              // Urgent Hiring
            </span>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {urgentJobs.map((job) => (
                <Link
                  key={job._id}
                  href={`/career/${job.slug}`}
                  className="text-sm text-[#D5D6D8] hover:text-[#F2EFE6] underline underline-offset-4 decoration-[#6A6E78] transition-colors"
                >
                  {job.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative py-16 bg-[#050912]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <CareerFilters
            filters={filters}
            initial={{
              search: params.search,
              department: params.department,
              location: params.location,
              employmentType: params.employmentType,
              experienceMin: params.experienceMin,
              experienceMax: params.experienceMax,
            }}
          />

          {jobs.length === 0 ? (
            <div className="border border-[#2a3344] py-24 text-center">
              <p className="text-[#D5D6D8] font-light">
                No open positions match these filters right now.
              </p>
              <Link
                href="/career"
                className="inline-block mt-4 font-mono text-xs tracking-widest uppercase text-[#6A6E78] hover:text-[#D5D6D8] underline underline-offset-4"
              >
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {jobs.map((job) => (
                <OpeningCard key={job._id} job={job} />
              ))}
            </div>
          )}

          {meta.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  {meta.hasPrevPage ? (
                    <Link
                      href={buildPageHref(params, page - 1)}
                      className={cn(buttonVariants({ variant: 'ghost', size: 'default' }), 'gap-1 px-2.5')}
                    >
                      Previous
                    </Link>
                  ) : (
                    <span className={cn(buttonVariants({ variant: 'ghost', size: 'default' }), 'gap-1 px-2.5 opacity-50 pointer-events-none')}>
                      Previous
                    </span>
                  )}
                </PaginationItem>

                {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === meta.totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <PaginationItem key={p}>
                      {idx > 0 && p - arr[idx - 1] > 1 && <PaginationEllipsis />}
                      <Link
                        href={buildPageHref(params, p)}
                        aria-current={p === page ? 'page' : undefined}
                        className={cn(
                          buttonVariants({ variant: p === page ? 'outline' : 'ghost', size: 'icon' }),
                          p === page && 'border-[#D5D6D8] text-[#F2EFE6]',
                        )}
                      >
                        {p}
                      </Link>
                    </PaginationItem>
                  ))}

                <PaginationItem>
                  {meta.hasNextPage ? (
                    <Link
                      href={buildPageHref(params, page + 1)}
                      className={cn(buttonVariants({ variant: 'ghost', size: 'default' }), 'gap-1 px-2.5')}
                    >
                      Next
                    </Link>
                  ) : (
                    <span className={cn(buttonVariants({ variant: 'ghost', size: 'default' }), 'gap-1 px-2.5 opacity-50 pointer-events-none')}>
                      Next
                    </span>
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
