import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { AssignedOpening } from '@/features/dashboard/types'

interface AssignedOpeningsTableProps {
  openings: AssignedOpening[]
}

export function AssignedOpeningsTable({ openings }: AssignedOpeningsTableProps) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {openings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                No openings assigned yet.
              </TableCell>
            </TableRow>
          ) : (
            openings.map((opening) => (
              <TableRow key={opening._id}>
                <TableCell>
                  <Link to={`/jobs/${opening._id}`} className="font-medium text-foreground hover:underline">
                    {opening.title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{opening.department}</TableCell>
                <TableCell className="text-muted-foreground">{opening.location}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={opening.isClosed ? 'secondary' : opening.isPublished ? 'success' : 'outline'}>
                      {opening.isClosed ? 'Closed' : opening.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                    {opening.isUrgent ? <Badge variant="destructive">Urgent</Badge> : null}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
