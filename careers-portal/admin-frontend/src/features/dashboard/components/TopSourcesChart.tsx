import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { ChartEmptyState } from '@/features/dashboard/components/ChartEmptyState'
import { ChartTooltipContent } from '@/features/dashboard/components/ChartTooltipContent'
import { CHART_CATEGORICAL, CHART_CHROME, useChartMode } from '@/features/dashboard/lib/chart-theme'
import { formatEnumLabel } from '@/features/dashboard/lib/format'
import type { TopSourcePoint } from '@/features/dashboard/types'

interface TopSourcesChartProps {
  data: TopSourcePoint[]
}

export function TopSourcesChart({ data }: TopSourcesChartProps) {
  const mode = useChartMode()
  const chrome = CHART_CHROME[mode]
  const palette = CHART_CATEGORICAL[mode]

  if (data.length === 0) {
    return <ChartEmptyState message="No applications yet" height={260} />
  }

  const height = Math.max(220, data.length * 36 + 24)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, left: 8, bottom: 4 }}>
        <XAxis type="number" allowDecimals={false} hide />
        <YAxis
          type="category"
          dataKey="source"
          tickFormatter={(value: string) => formatEnumLabel(value)}
          width={96}
          tick={{ fill: chrome.muted, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: chrome.gridline, opacity: 0.5 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const point = payload[0].payload as TopSourcePoint
            const index = data.findIndex((source) => source.source === point.source)
            return (
              <ChartTooltipContent
                title={formatEnumLabel(point.source)}
                rows={[{ label: 'Applications', value: String(point.count), color: palette[index % palette.length] }]}
              />
            )
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24} isAnimationActive={false}>
          {data.map((source, index) => (
            <Cell key={source.source} fill={palette[index % palette.length]} />
          ))}
          <LabelList dataKey="count" position="right" fill={chrome.textSecondary} fontSize={11} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
