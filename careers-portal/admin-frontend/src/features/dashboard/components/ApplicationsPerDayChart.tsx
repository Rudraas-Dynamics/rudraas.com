import { format, parseISO } from 'date-fns'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { ChartEmptyState } from '@/features/dashboard/components/ChartEmptyState'
import { ChartTooltipContent } from '@/features/dashboard/components/ChartTooltipContent'
import { CHART_CHROME, CHART_SINGLE_HUE, useChartMode } from '@/features/dashboard/lib/chart-theme'
import type { ApplicationsPerDayPoint } from '@/features/dashboard/types'

interface ApplicationsPerDayChartProps {
  data: ApplicationsPerDayPoint[]
}

export function ApplicationsPerDayChart({ data }: ApplicationsPerDayChartProps) {
  const mode = useChartMode()
  const chrome = CHART_CHROME[mode]
  const color = CHART_SINGLE_HUE[mode]

  if (data.length === 0) {
    return <ChartEmptyState message="No applications yet" height={300} />
  }

  const tickInterval = Math.max(0, Math.ceil(data.length / 7) - 1)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={chrome.gridline} />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) => format(parseISO(value), 'MMM d')}
          tick={{ fill: chrome.muted, fontSize: 11 }}
          axisLine={{ stroke: chrome.baseline }}
          tickLine={false}
          interval={tickInterval}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: chrome.muted, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip
          cursor={{ stroke: chrome.baseline, strokeWidth: 1 }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const point = payload[0]
            return (
              <ChartTooltipContent
                title={format(parseISO(String(label)), 'MMM d, yyyy')}
                rows={[{ label: 'Applications', value: String(point.value ?? 0), color }]}
              />
            )
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke={color}
          strokeWidth={2}
          fill={color}
          fillOpacity={0.12}
          activeDot={{ r: 4, stroke: chrome.surface, strokeWidth: 2, fill: color }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
