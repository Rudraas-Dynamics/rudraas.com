import type { LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { formatCompactNumber } from '@/features/dashboard/lib/format'

interface StatTileProps {
  label: string
  value: number
  icon?: LucideIcon
  subLabel?: string
}

export function StatTile({ label, value, icon: Icon, subLabel }: StatTileProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold text-foreground">{formatCompactNumber(value)}</p>
          {subLabel ? <p className="text-xs text-muted-foreground">{subLabel}</p> : null}
        </div>
        {Icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </CardContent>
    </Card>
  )
}
