interface ChartEmptyStateProps {
  message?: string
  height?: number
}

export function ChartEmptyState({ message = 'No data yet', height = 280 }: ChartEmptyStateProps) {
  return (
    <div
      style={{ height }}
      className="flex items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground"
    >
      {message}
    </div>
  )
}
