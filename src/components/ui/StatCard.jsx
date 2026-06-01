import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../../utils/cn'
import Skeleton from './Skeleton'

/**
 * StatCard — KPI card for dashboard widgets.
 *
 * Displays: icon, label, value (animated counter), trend, sublabel.
 * Used in: AdminDashboard (Phase 4), EmployeeDashboard (Phase 16).
 *
 * Backend source: GET /v1/dashboard/stats
 */

const AnimatedCounter = ({ value }) => {
  // Simple display — real animation handled by Framer Motion counter-up
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {value}
    </motion.span>
  )
}

const StatCard = ({
  label,
  value,
  sublabel,
  icon: Icon,
  iconBg   = 'bg-brand-50 dark:bg-brand-900/20',
  iconColor= 'text-brand-500 dark:text-brand-400',
  trend,      // number (positive = up, negative = down, 0 = flat)
  trendLabel,
  loading  = false,
  className,
  onClick,
}) => {
  if (loading) return <Skeleton.Card className={className} />

  const trendDir = trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat'
  const TrendIcon = trendDir === 'up'
    ? TrendingUp
    : trendDir === 'down'
      ? TrendingDown
      : Minus

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={cn(
        'rounded-xl border border-surface-200 bg-white p-5',
        'dark:border-dark-600 dark:bg-dark-700',
        onClick && 'cursor-pointer transition-shadow duration-200 hover:shadow-card-hover',
        className
      )}
    >
      {/* Top row: icon + label */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
        {Icon && (
          <div className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg',
            iconBg
          )}>
            <Icon className={cn('h-4.5 w-4.5', iconColor)} />
          </div>
        )}
      </div>

      {/* Value */}
      <p className="mb-1 text-2xl font-bold text-slate-800 dark:text-slate-100">
        <AnimatedCounter value={value} />
      </p>

      {/* Trend + sublabel */}
      <div className="flex items-center gap-2">
        {trend !== undefined && trendLabel && (
          <span className={cn(
            'flex items-center gap-0.5 text-xs font-medium',
            trendDir === 'up'   && 'text-emerald-600 dark:text-emerald-400',
            trendDir === 'down' && 'text-red-500 dark:text-red-400',
            trendDir === 'flat' && 'text-slate-400',
          )}>
            <TrendIcon className="h-3 w-3" />
            {trendLabel}
          </span>
        )}
        {sublabel && (
          <span className="text-xs text-slate-400">{sublabel}</span>
        )}
      </div>
    </motion.div>
  )
}

export default StatCard