import { Link } from 'react-router-dom'

import { usePageTitle } from '@/components/layout/page-header-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function JobsListPage() {
  usePageTitle('Jobs')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold">Jobs</h2>
          <p className="text-sm text-muted-foreground">
            Manage open requisitions, publish postings, and track pipeline status.
          </p>
        </div>
        <Button asChild>
          <Link to="/jobs/new">New job</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job requisitions</CardTitle>
          <CardDescription>The job listing table lands here in a follow-up pass.</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  )
}
