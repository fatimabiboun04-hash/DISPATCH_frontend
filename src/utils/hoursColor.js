import { getHoursStatus, HOURS_COLORS } from '../constants/hoursThresholds'

/**
 * Returns Tailwind classes for hours display based on threshold.
 * Usage: const { text, bg, bar } = getHoursClasses(42)
 */
export const getHoursClasses = (hours) => {
  const status = getHoursStatus(hours ?? 0)
  return HOURS_COLORS[status]
}

/**
 * Returns percentage for hours progress bar (capped at 100).
 * Based on 44h max before overtime.
 */
export const getHoursPercent = (hours, max = 44) => {
  if (!hours) return 0
  return Math.min((hours / max) * 100, 100)
}