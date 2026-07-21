import { usePageTitle } from '@/components/layout/page-header-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ApplicationsListPage() {
  usePageTitle('Applications')

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-semibold">Applications</h2>
        <p className="text-sm text-muted-foreground">
          Review candidate applications, statuses, and hiring pipeline activity.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidate applications</CardTitle>
          <CardDescription>The applications table and filters land here in a follow-up pass.</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  )
}
