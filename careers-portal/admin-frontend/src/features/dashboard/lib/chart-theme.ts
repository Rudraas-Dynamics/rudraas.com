import { useTheme } from '@/components/theme-provider'

export type ChartMode = 'light' | 'dark'

export function useChartMode(): ChartMode {
  const { theme } = useTheme()
  return theme
}

export const CHART_CATEGORICAL: Record<ChartMode, string[]> = {
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'],
  dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
}

export const CHART_SINGLE_HUE: Record<ChartMode, string> = {
  light: CHART_CATEGORICAL.light[0],
  dark: CHART_CATEGORICAL.dark[0],
}

interface ChartChrome {
  surface: string
  textPrimary: string
  textSecondary: string
  muted: string
  gridline: string
  baseline: string
}

export const CHART_CHROME: Record<ChartMode, ChartChrome> = {
  light: {
    surface: '#fcfcfb',
    textPrimary: '#0b0b0b',
    textSecondary: '#52514e',
    muted: '#898781',
    gridline: '#e1e0d9',
    baseline: '#c3c2b7',
  },
  dark: {
    surface: '#1a1a19',
    textPrimary: '#ffffff',
    textSecondary: '#c3c2b7',
    muted: '#898781',
    gridline: '#2c2c2a',
    baseline: '#383835',
  },
}

interface RampStep {
  step: number
  hex: string
}

const SEQUENTIAL_BLUE_RAMP: RampStep[] = [
  { step: 100, hex: '#cde2fb' },
  { step: 150, hex: '#b7d3f6' },
  { step: 200, hex: '#9ec5f4' },
  { step: 250, hex: '#86b6ef' },
  { step: 300, hex: '#6da7ec' },
  { step: 350, hex: '#5598e7' },
  { step: 400, hex: '#3987e5' },
  { step: 450, hex: '#2a78d6' },
  { step: 500, hex: '#256abf' },
  { step: 550, hex: '#1c5cab' },
  { step: 600, hex: '#184f95' },
  { step: 650, hex: '#104281' },
  { step: 700, hex: '#0d366b' },
]

/**
 * One-hue, monotone-lightness ramp for ordinal data (funnel/pipeline stages)
 * where the position in the sequence is part of what the color should show.
 * Light mode stays at/above step 250 and dark mode at/below step 600 so the
 * lightest step in either mode still clears the ordinal 2:1 contrast floor.
 */
export function getOrdinalRamp(count: number, mode: ChartMode): string[] {
  const allowed =
    mode === 'light'
      ? SEQUENTIAL_BLUE_RAMP.filter((step) => step.step >= 250)
      : SEQUENTIAL_BLUE_RAMP.filter((step) => step.step <= 600)

  if (count <= 1) {
    return [allowed[Math.floor(allowed.length / 2)].hex]
  }

  const lastIndex = allowed.length - 1
  return Array.from({ length: count }, (_, index) => {
    const rampIndex = Math.round((index * lastIndex) / (count - 1))
    return allowed[rampIndex].hex
  })
}
