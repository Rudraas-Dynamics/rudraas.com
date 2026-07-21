import { useParams } from 'react-router-dom'

import { usePageTitle } from '@/components/layout/page-header-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()

  usePageTitle('Application Details')

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-semibold">Application details</h2>
        <p className="text-sm text-muted-foreground">
          Viewing application {id} — resume, notes, and status timeline land here in a follow-up pass.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidate overview</CardTitle>
          <CardDescription>Full application detail view lands here.</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  )
}
