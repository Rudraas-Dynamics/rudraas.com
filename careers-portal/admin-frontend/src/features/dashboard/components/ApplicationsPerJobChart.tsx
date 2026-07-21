import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { ChartEmptyState } from '@/features/dashboard/components/ChartEmptyState'
import { ChartTooltipContent } from '@/features/dashboard/components/ChartTooltipContent'
import { CHART_CHROME, CHART_SINGLE_HUE, useChartMode } from '@/features/dashboard/lib/chart-theme'
import { truncateText } from '@/features/dashboard/lib/format'
import type { ApplicationsPerJobPoint } from '@/features/dashboard/types'

interface ApplicationsPerJobChartProps {
  data: ApplicationsPerJobPoint[]
}

interface JobAxisTickProps {
  x?: number
  y?: number
  payload?: { value: string }
}

function JobAxisTick({ x = 0, y = 0, payload }: JobAxisTickProps) {
  const title = payload?.value ?? ''
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fontSize={11} className="fill-muted-foreground">
      <title>{title}</title>
      {truncateText(title, 20)}
    </text>
  )
}

export function ApplicationsPerJobChart({ data }: ApplicationsPerJobChartProps) {
  const mode = useChartMode()
  const chrome = CHART_CHROME[mode]
  const color = CHART_SINGLE_HUE[mode]

  if (data.length === 0) {
    return <ChartEmptyState message="No applications yet" height={320} />
  }

  const height = Math.max(220, data.length * 32 + 24)

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
          dataKey="title"
          width={110}
          tick={<JobAxisTick />}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: chrome.gridline, opacity: 0.5 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const point = payload[0].payload as ApplicationsPerJobPoint
            return (
              <ChartTooltipContent
                title={point.title}
                rows={[{ label: 'Applications', value: String(point.count), color }]}
              />
            )
          }}
        />
        <Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} maxBarSize={22} isAnimationActive={false}>
          <LabelList dataKey="count" position="right" fill={chrome.textSecondary} fontSize={11} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
