import { memo } from 'react'
import { cn } from '../../utils/cn'
import { getHoursClasses, getHoursPercent } from '../../utils/hoursColor'
import { getHoursStatus, HOURS_ALERTS } from '../../constants/hoursThresholds'
import { formatHours } from '../../utils/formatters'

/**
 * HoursBar — weekly hours progress bar with threshold colors.
 *
 * Backend source: HoursCalculatorService.getHoursStatus() returns:
 *   { hours, limit, color: 'green'|'orange'|'red', alert_message, is_overtime, is_under_hours }
 *
 * 0–38h  → green bar
 * 39–44h → orange bar
 * 45h+   → red bar + blink animation
 */
const HoursBar = ({
  hours   = 0,
  limit   = 44,
  showLabel  = true,
  showAlert  = false,
  compact    = false,
  className,
}) => {
  const status  = getHoursStatus(hours)
  const classes = getHoursClasses(hours)
  const pct     = getHoursPercent(hours, limit)

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {/* Label row */}
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={cn('text-xs font-semibold', classes.text)}>
            {formatHours(hours, true)}
          </span>
          {!compact && (
            <span className="text-2xs text-slate-400">
              / {formatHours(limit, true)}
            </span>
          )}
        </div>
      )}

      {/* Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full
                      bg-surface-200 dark:bg-dark-500">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            classes.bar,
            status === 'danger' && 'animate-pulse'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Alert message */}
      {showAlert && status !== 'safe' && (
        <p className={cn('text-2xs font-medium', classes.text)}>
          {status === 'danger'
            ? HOURS_ALERTS.overtime
            : HOURS_ALERTS.underHours
          }
        </p>
      )}
    </div>
  )
}

export default memo(HoursBar)