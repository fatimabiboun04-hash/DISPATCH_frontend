import { motion } from 'framer-motion'
import { Calendar, Users, Lock } from 'lucide-react'
import { Badge } from '../ui'
import { cn }    from '../../utils/cn'

/**
 * WeekHistoryCard — summary card for one past week.
 *
 * Data built by historyService.getWeeklyHistory():
 * { week_number, year, weekLabel, weekStart, weekEnd, planning_count }
 *
 * onClick → navigate to that week in planning history grid.
 */
const WeekHistoryCard = ({
  week,
  selected  = false,
  onClick,
  index     = 0,
}) => (
  <motion.button
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, delay: index * 0.04 }}
    onClick={onClick}
    className={cn(
      'flex flex-col gap-3 rounded-2xl border-2 p-4 text-left w-full',
      'transition-all duration-200',
      'hover:shadow-medium focus:outline-none',
      'focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
      selected
        ? 'border-brand-400 bg-brand-50 shadow-medium dark:border-brand-600 dark:bg-brand-900/15'
        : 'border-surface-200 bg-white hover:border-brand-200 dark:border-dark-600 dark:bg-dark-700'
    )}
  >
    {/* Header */}
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg',
          selected
            ? 'bg-brand-100 dark:bg-brand-900/30'
            : 'bg-surface-100 dark:bg-dark-600'
        )}>
          <Calendar className={cn(
            'h-4 w-4',
            selected ? 'text-brand-500' : 'text-slate-400'
          )} />
        </div>
        <div>
          <p className={cn(
            'text-xs font-bold',
            selected
              ? 'text-brand-700 dark:text-brand-300'
              : 'text-slate-700 dark:text-slate-200'
          )}>
            S{week.week_number}/{week.year}
          </p>
        </div>
      </div>
      <Lock className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
    </div>

    {/* Date range */}
    <p className="text-2xs text-slate-400 dark:text-slate-500 leading-relaxed">
      {week.weekLabel}
    </p>

    {/* Stats */}
    <div className="flex items-center gap-1.5">
      <Users className="h-3 w-3 text-slate-400" />
      <span className="text-xs text-slate-500">
        {week.planning_count} assignation{week.planning_count !== 1 ? 's' : ''}
      </span>
    </div>

    {/* Selected indicator */}
    {selected && (
      <Badge variant="primary" size="sm">
        Sélectionné
      </Badge>
    )}
  </motion.button>
)

export default WeekHistoryCard