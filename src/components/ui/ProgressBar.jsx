import { cn } from '../../utils/cn'

/**
 * ProgressBar — generic percentage bar.
 * Used for coverage gauge linear display and report progress.
 */
const ProgressBar = ({
  value    = 0,      // 0–100
  max      = 100,
  label,
  showValue = false,
  color     = 'brand',  // brand | success | warning | danger
  size      = 'md',
  animated  = false,
  className,
}) => {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100)

  const COLORS = {
    brand:   'bg-brand-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger:  'bg-red-500',
  }

  const HEIGHTS = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label    && <span className="text-xs text-slate-500">{label}</span>}
          {showValue && <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={cn(
        'w-full overflow-hidden rounded-full bg-surface-200 dark:bg-dark-500',
        HEIGHTS[size] || HEIGHTS.md
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            COLORS[color] || COLORS.brand,
            animated && 'animate-pulse'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar