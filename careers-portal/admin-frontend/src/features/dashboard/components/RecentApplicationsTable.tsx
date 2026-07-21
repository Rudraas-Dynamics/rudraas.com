import { formatDistanceToNow } from 'date-fns'

import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatEnumLabel } from '@/features/dashboard/lib/format'
import type { RecentApplicationSummary } from '@/features/dashboard/types'

interface RecentApplicationsTableProps {
  applications: RecentApplicationSummary[]
}

const TERMINAL_SUCCESS_STATUSES = new Set(['SELECTED', 'OFFER_RELEASED', 'JOINED'])
const TERMINAL_REJECTED_STATUSES = new Set(['REJECTED', 'WITHDRAWN'])

function getStatusBadgeVariant(status: string): BadgeProps['variant'] {
  if (TERMINAL_SUCCESS_STATUSES.has(status)) return 'success'
  if (TERMINAL_REJECTED_STATUSES.has(status)) return 'destructive'
  if (status === 'APPLIED') return 'secondary'
  return 'default'
}

function formatAppliedAt(value: string): string {
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true })
  } catch {
    return '—'
  }
}

export function RecentApplicationsTable({ applications }: RecentApplicationsTableProps) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Candidate</TableHead>
            <TableHead>Job</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead className="text-right">Applied</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                No applications yet.
              </TableCell>
            </TableRow>
          ) : (
            applications.map((application) => (
              <TableRow key={application._id}>
                <TableCell>
                  <div className="font-medium text-foreground">{application.name}</div>
                  <div className="text-xs text-muted-foreground">{application.email}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">{application.jobTitle}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(application.status)}>
                    {formatEnumLabel(application.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{formatEnumLabel(application.source)}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                  {formatAppliedAt(application.createdAt)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
