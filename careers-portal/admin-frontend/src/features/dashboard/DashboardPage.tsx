import { usePageTitle } from '@/components/layout/page-header-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  usePageTitle('Dashboard')

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-semibold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          At-a-glance hiring metrics across jobs and applications.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Dashboard widgets and charts land here in a follow-up pass.</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  )
}
