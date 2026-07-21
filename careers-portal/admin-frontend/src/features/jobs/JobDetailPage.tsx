import { useParams } from 'react-router-dom'

import { usePageTitle } from '@/components/layout/page-header-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === undefined

  usePageTitle(isNew ? 'New Job' : 'Job Details')

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-semibold">{isNew ? 'New job' : 'Job details'}</h2>
        <p className="text-sm text-muted-foreground">
          {isNew
            ? 'Create a new job requisition.'
            : `Viewing and editing job ${id} — full form lands here in a follow-up pass.`}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isNew ? 'Job form' : 'Job overview'}</CardTitle>
          <CardDescription>Full job creation/edit form and status controls land here.</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  )
}
