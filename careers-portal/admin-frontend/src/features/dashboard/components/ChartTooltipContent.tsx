interface ChartTooltipRow {
  label: string
  value: string
  color?: string
}

interface ChartTooltipContentProps {
  title?: string
  rows: ChartTooltipRow[]
}

export function ChartTooltipContent({ title, rows }: ChartTooltipContentProps) {
  if (rows.length === 0) return null

  return (
    <div className="min-w-32 rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      {title ? <div className="mb-1.5 font-medium text-popover-foreground">{title}</div> : null}
      <div className="space-y-1">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-2">
            {row.color ? (
              <span
                aria-hidden
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: row.color }}
              />
            ) : null}
            <span className="text-muted-foreground">{row.label}</span>
            <span className="ml-auto font-semibold tabular-nums text-popover-foreground">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
