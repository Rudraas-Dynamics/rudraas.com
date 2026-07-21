import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { PublicJob } from '@/lib/career-api'
import { formatEmploymentType, formatExperienceRange } from '@/lib/career-format'

export function OpeningCard({ job }: { job: PublicJob }) {
  const postedAt = job.openingDate ?? job.createdAt

  return (
    <Card className="border-[#2a3344] bg-[#0a1019] hover:border-[#6A6E78] transition-colors duration-200">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-medium text-[#F2EFE6] leading-snug">
            {job.title}
          </h3>
          {job.isUrgent && (
            <Badge className="border-transparent bg-[#D5D6D8] text-[#050912] font-mono text-[10px] tracking-widest uppercase shrink-0">
              Urgent
            </Badge>
          )}
        </div>
        <p className="font-mono text-xs tracking-wider text-[#6A6E78] uppercase">
          {job.department}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-[#2a3344] text-[#D5D6D8] font-mono text-[10px] tracking-wider uppercase">
            {formatEmploymentType(job.employmentType)}
          </Badge>
          <Badge variant="outline" className="border-[#2a3344] text-[#D5D6D8] font-mono text-[10px] tracking-wider uppercase">
            {job.location}
          </Badge>
          <Badge variant="outline" className="border-[#2a3344] text-[#D5D6D8] font-mono text-[10px] tracking-wider uppercase">
            {formatExperienceRange(job.experience.minYears, job.experience.maxYears)}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2">
          <span className="font-mono text-[10px] tracking-wider text-[#6A6E78] uppercase">
            Posted {formatDistanceToNow(new Date(postedAt), { addSuffix: true })}
          </span>
          <Button asChild size="sm" className="bg-[#F2EFE6] text-[#050912] hover:bg-[#D5D6D8] font-medium tracking-widest uppercase text-xs">
            <Link href={`/career/${job.slug}`}>Apply →</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
