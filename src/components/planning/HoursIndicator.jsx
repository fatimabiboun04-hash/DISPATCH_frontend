import { getHoursClasses } from '../../utils/hoursColor'
import { HOURS_ALERTS } from '../../constants/hoursThresholds'
import { cn } from '../../utils/cn'

/**
 * HoursIndicator — compact hours display with threshold color.
 * Used on user rows inside PlanningCard.
 *
 * hours: current weekly hours (from planning context or suggestion)
 * limit: weekly limit (default 44)
 */
const HoursIndicator = ({ hours = 0, limit = 44, compact = false }) => {
  const classes = getHoursClasses(hours)
  const pct     = Math.min((hours / limit) * 100, 100)

  if (compact) {
    return (
      <span className={cn('text-2xs font-semibold tabular-nums', classes.text)}>
        {hours}h
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <div className="flex items-center justify-between gap-1">
        <span className={cn('text-2xs font-semibold', classes.text)}>
          {hours}h
        </span>
        <span className="text-2xs text-slate-400">/{limit}h</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-surface-200 dark:bg-dark-500">
        <div
          className={cn('h-full rounded-full', classes.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default HoursIndicator