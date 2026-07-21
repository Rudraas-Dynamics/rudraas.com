export interface AdminDashboardCards {
  totalOpenings: number
  activeOpenings: number
  closedOpenings: number
  urgentHiring: number
  totalApplications: number
  todaysApplications: number
  applicationsThisMonth: number
  hiringPipeline: number
}

export interface ApplicationsPerDayPoint {
  date: string
  count: number
}

export interface ApplicationsPerJobPoint {
  jobId: string
  title: string
  count: number
}

export interface StatusDistributionPoint {
  status: string
  count: number
}

export interface HiringFunnelStage {
  stage: string
  count: number
}

export interface TopSourcePoint {
  source: string
  count: number
}

export interface RecentApplicationSummary {
  _id: string
  name: string
  email: string
  status: string
  source: string
  createdAt: string
  jobTitle: string
}

export interface AdminDashboardCharts {
  applicationsPerDay: ApplicationsPerDayPoint[]
  applicationsPerJob: ApplicationsPerJobPoint[]
  statusDistribution: StatusDistributionPoint[]
  hiringFunnel: HiringFunnelStage[]
  topSources: TopSourcePoint[]
  recentApplications: RecentApplicationSummary[]
}

export interface AdminDashboard {
  cards: AdminDashboardCards
  charts: AdminDashboardCharts
}

export interface AssignedOpening {
  _id: string
  title: string
  department: string
  location: string
  isPublished: boolean
  isClosed: boolean
  isUrgent: boolean
  createdAt: string
}

export interface UrgentHiringJob {
  _id: string
  title: string
  department: string
  location: string
  createdAt: string
}

export interface InterviewPipelineStage {
  stage: string
  count: number
}

export interface HrDashboard {
  assignedOpenings: AssignedOpening[]
  latestApplications: RecentApplicationSummary[]
  urgentHiring: UrgentHiringJob[]
  pendingScreening: number
  interviewPipeline: InterviewPipelineStage[]
}
