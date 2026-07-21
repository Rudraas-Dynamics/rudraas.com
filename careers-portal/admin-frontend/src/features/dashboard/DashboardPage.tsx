import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  Archive,
  Briefcase,
  CalendarClock,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  Users,
  Workflow,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { usePageTitle } from '@/components/layout/page-header-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/lib/api-client'
import { useAuth } from '@/features/auth/auth-context'
import { ApplicationsPerDayChart } from '@/features/dashboard/components/ApplicationsPerDayChart'
import { ApplicationsPerJobChart } from '@/features/dashboard/components/ApplicationsPerJobChart'
import { AssignedOpeningsTable } from '@/features/dashboard/components/AssignedOpeningsTable'
import { ChartCard } from '@/features/dashboard/components/ChartCard'
import { HiringFunnelChart } from '@/features/dashboard/components/HiringFunnelChart'
import { InterviewPipelineChart } from '@/features/dashboard/components/InterviewPipelineChart'
import { RecentApplicationsTable } from '@/features/dashboard/components/RecentApplicationsTable'
import { StatTile } from '@/features/dashboard/components/StatTile'
import { StatusDistributionChart } from '@/features/dashboard/components/StatusDistributionChart'
import { TopSourcesChart } from '@/features/dashboard/components/TopSourcesChart'
import {
  adminDashboardQueryKey,
  getAdminDashboard,
  getHrDashboard,
  hrDashboardQueryKey,
} from '@/features/dashboard/dashboard-api'

function DashboardErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-destructive">
          {getApiErrorMessage(error, 'Failed to load dashboard data')}
        </p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </CardContent>
    </Card>
  )
}

function StatTileSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-2 p-5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-7 w-16" />
      </CardContent>
    </Card>
  )
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <StatTileSkeleton key={index} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-[300px] w-full rounded-lg lg:col-span-2" />
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[300px] w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  )
}

function HrDashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <StatTileSkeleton key={index} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
      <Skeleton className="h-56 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  )
}

function AdminDashboardContent() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: adminDashboardQueryKey,
    queryFn: getAdminDashboard,
  })

  if (isLoading) return <AdminDashboardSkeleton />
  if (isError || !data) return <DashboardErrorState error={error} onRetry={() => refetch()} />

  const { cards, charts } = data.data

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Total openings" value={cards.totalOpenings} icon={Briefcase} />
        <StatTile label="Active openings" value={cards.activeOpenings} icon={CheckCircle2} />
        <StatTile label="Closed openings" value={cards.closedOpenings} icon={Archive} />
        <StatTile label="Urgent hiring" value={cards.urgentHiring} icon={AlertTriangle} />
        <StatTile label="Total applications" value={cards.totalApplications} icon={Users} />
        <StatTile label="Today's applications" value={cards.todaysApplications} icon={CalendarClock} />
        <StatTile label="Applications this month" value={cards.applicationsThisMonth} icon={CalendarRange} />
        <StatTile label="Hiring pipeline" value={cards.hiringPipeline} icon={Workflow} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Applications per day"
          description="Last 30 days"
          className="lg:col-span-2"
        >
          <ApplicationsPerDayChart data={charts.applicationsPerDay} />
        </ChartCard>
        <ChartCard title="Top jobs by applications" description="Top 10 openings">
          <ApplicationsPerJobChart data={charts.applicationsPerJob} />
        </ChartCard>
        <ChartCard title="Status distribution" description="Applications by current status">
          <StatusDistributionChart data={charts.statusDistribution} />
        </ChartCard>
        <ChartCard title="Hiring funnel" description="Candidates by pipeline stage">
          <HiringFunnelChart data={charts.hiringFunnel} />
        </ChartCard>
        <ChartCard title="Top sources" description="Top 5 candidate sources">
          <TopSourcesChart data={charts.topSources} />
        </ChartCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent applications</CardTitle>
          <CardDescription>Latest candidates across every opening</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentApplicationsTable applications={charts.recentApplications} />
        </CardContent>
      </Card>
    </div>
  )
}

function HrDashboardContent() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: hrDashboardQueryKey,
    queryFn: getHrDashboard,
  })

  if (isLoading) return <HrDashboardSkeleton />
  if (isError || !data) return <DashboardErrorState error={error} onRetry={() => refetch()} />

  const { assignedOpenings, latestApplications, urgentHiring, pendingScreening, interviewPipeline } = data.data

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Pending screening" value={pendingScreening} icon={ClipboardList} />
        <StatTile label="Assigned openings" value={assignedOpenings.length} icon={Briefcase} />
        <StatTile label="Urgent hiring" value={urgentHiring.length} icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Urgent hiring</CardTitle>
            <CardDescription>Openings flagged as urgent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {urgentHiring.length === 0 ? (
              <p className="text-sm text-muted-foreground">No urgent openings right now.</p>
            ) : (
              urgentHiring.map((job) => (
                <Link
                  key={job._id}
                  to={`/jobs/${job._id}`}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <div>
                    <div className="font-medium text-foreground">{job.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {job.department} · {job.location}
                    </div>
                  </div>
                  <Badge variant="destructive">Urgent</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <ChartCard title="Interview pipeline" description="Candidates by interview stage">
          <InterviewPipelineChart data={interviewPipeline} />
        </ChartCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned openings</CardTitle>
          <CardDescription>Jobs currently assigned to you</CardDescription>
        </CardHeader>
        <CardContent>
          <AssignedOpeningsTable openings={assignedOpenings} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent applications</CardTitle>
          <CardDescription>Latest candidates across your openings</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentApplicationsTable applications={latestApplications} />
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  usePageTitle('Dashboard')
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-semibold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          {user.role === 'ADMIN'
            ? 'At-a-glance hiring metrics across jobs and applications.'
            : 'Your assigned openings and candidate pipeline.'}
        </p>
      </div>

      {user.role === 'ADMIN' ? <AdminDashboardContent /> : <HrDashboardContent />}
    </div>
  )
}
