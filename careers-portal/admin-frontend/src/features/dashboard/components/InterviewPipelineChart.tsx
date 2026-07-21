import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { ChartEmptyState } from '@/features/dashboard/components/ChartEmptyState'
import { ChartTooltipContent } from '@/features/dashboard/components/ChartTooltipContent'
import { CHART_CHROME, getOrdinalRamp, useChartMode } from '@/features/dashboard/lib/chart-theme'
import { formatEnumLabel } from '@/features/dashboard/lib/format'
import type { InterviewPipelineStage } from '@/features/dashboard/types'

interface InterviewPipelineChartProps {
  data: InterviewPipelineStage[]
}

export function InterviewPipelineChart({ data }: InterviewPipelineChartProps) {
  const mode = useChartMode()
  const chrome = CHART_CHROME[mode]

  if (data.length === 0) {
    return <ChartEmptyState message="No interviews scheduled yet" height={220} />
  }

  const ramp = getOrdinalRamp(data.length, mode)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, left: 8, bottom: 4 }}>
        <XAxis type="number" allowDecimals={false} hide />
        <YAxis
          type="category"
          dataKey="stage"
          tickFormatter={(value: string) => formatEnumLabel(value)}
          width={128}
          tick={{ fill: chrome.muted, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: chrome.gridline, opacity: 0.5 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const point = payload[0].payload as InterviewPipelineStage
            const index = data.findIndex((stage) => stage.stage === point.stage)
            return (
              <ChartTooltipContent
                title={formatEnumLabel(point.stage)}
                rows={[{ label: 'Candidates', value: String(point.count), color: ramp[index] }]}
              />
            )
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={26} isAnimationActive={false}>
          {data.map((stage, index) => (
            <Cell key={stage.stage} fill={ramp[index]} />
          ))}
          <LabelList dataKey="count" position="right" fill={chrome.textSecondary} fontSize={11} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
