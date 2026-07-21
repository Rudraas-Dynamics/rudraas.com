import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { ChartEmptyState } from '@/features/dashboard/components/ChartEmptyState'
import { ChartTooltipContent } from '@/features/dashboard/components/ChartTooltipContent'
import { CHART_CHROME, CHART_SINGLE_HUE, useChartMode } from '@/features/dashboard/lib/chart-theme'
import { formatEnumLabel } from '@/features/dashboard/lib/format'
import type { StatusDistributionPoint } from '@/features/dashboard/types'

interface StatusDistributionChartProps {
  data: StatusDistributionPoint[]
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const mode = useChartMode()
  const chrome = CHART_CHROME[mode]
  const color = CHART_SINGLE_HUE[mode]

  if (data.length === 0) {
    return <ChartEmptyState message="No applications yet" height={380} />
  }

  const height = Math.max(260, data.length * 28 + 24)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, left: 8, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke={chrome.gridline} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fill: chrome.muted, fontSize: 11 }}
          axisLine={{ stroke: chrome.baseline }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="status"
          tickFormatter={(value: string) => formatEnumLabel(value)}
          width={112}
          tick={{ fill: chrome.muted, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: chrome.gridline, opacity: 0.5 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const point = payload[0].payload as StatusDistributionPoint
            return (
              <ChartTooltipContent
                title={formatEnumLabel(point.status)}
                rows={[{ label: 'Applications', value: String(point.count), color }]}
              />
            )
          }}
        />
        <Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} maxBarSize={20} isAnimationActive={false}>
          <LabelList dataKey="count" position="right" fill={chrome.textSecondary} fontSize={11} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
