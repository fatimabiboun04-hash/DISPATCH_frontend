/**
 * Hours thresholds — match backend HoursCalculatorService exactly.
 * 0–38 → green (safe)
 * 39–44 → orange (warning)
 * 45+ → red (danger / overtime)
 */
export const HOURS = {
  SAFE_MAX:    38,
  WARNING_MAX: 44,
}

/**
 * Returns the threshold category for a given hours value.
 */
export const getHoursStatus = (hours) => {
  if (hours <= HOURS.SAFE_MAX)    return 'safe'
  if (hours <= HOURS.WARNING_MAX) return 'warning'
  return 'danger'
}

/**
 * Tailwind color classes per threshold.
 */
export const HOURS_COLORS = {
  safe: {
    text: 'text-emerald-600 dark:text-emerald-400',
    bg:   'bg-emerald-50 dark:bg-emerald-900/20',
    bar:  'bg-emerald-500',
  },
  warning: {
    text: 'text-amber-600 dark:text-amber-400',
    bg:   'bg-amber-50 dark:bg-amber-900/20',
    bar:  'bg-amber-500',
  },
  danger: {
    text: 'text-red-600 dark:text-red-400',
    bg:   'bg-red-50 dark:bg-red-900/20',
    bar:  'bg-red-500',
    extra: 'animate-blink-red',
  },
}

/**
 * Alert messages — match backend French messages exactly.
 */
export const HOURS_ALERTS = {
  overtime:   'Alerte: Heures Supplémentaires Détectées',
  underHours: 'Quota non atteint',
}