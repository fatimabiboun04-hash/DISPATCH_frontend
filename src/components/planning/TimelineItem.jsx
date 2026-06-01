import { motion } from 'framer-motion'
import { cn }     from '../../utils/cn'

/**
 * TimelineItem — one task/shift block in the employee vertical timeline.
 *
 * Per spec states:
 *   UPCOMING   → grey, future time
 *   ACTIVE     → highlighted, current time within range
 *   BREAK      → amber, pause
 *   ENDED      → muted, past time
 *
 * Data from GET /v1/me/planning → plain array (not paginated)
 * Each planning: { id, date, shift: { name, type, start_time, end_time }, week_number, year }
 */

const STATE_CONFIG = {
  UPCOMING: {
    dot:    'bg-slate-300 dark:bg-dark-400',
    card:   'border-surface-200 bg-white dark:border-dark-600 dark:bg-dark-700',
    time:   'text-slate-500 dark:text-slate-400',
    label:  'text-slate-600 dark:text-slate-300',
    badge:  'bg-slate-100 text-slate-500 dark:bg-dark-600 dark:text-slate-400',
  },
  ACTIVE: {
    dot:    'bg-emerald-500 animate-pulse',
    card:   'border-emerald-300 bg-emerald-50 shadow-medium dark:border-emerald-700 dark:bg-emerald-900/15',
    time:   'text-emerald-600 dark:text-emerald-400 font-semibold',
    label:  'text-emerald-700 dark:text-emerald-300 font-semibold',
    badge:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  BREAK: {
    dot:    'bg-amber-500',
    card:   'border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/10',
    time:   'text-amber-600 dark:text-amber-400',
    label:  'text-amber-700 dark:text-amber-300',
    badge:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  ENDED: {
    dot:    'bg-slate-200 dark:bg-dark-500',
    card:   'border-surface-100 bg-surface-50 opacity-60 dark:border-dark-600 dark:bg-dark-800',
    time:   'text-slate-400',
    label:  'text-slate-400',
    badge:  'bg-slate-100 text-slate-400 dark:bg-dark-600',
  },
}

const STATE_LABELS = {
  UPCOMING: 'À venir',
  ACTIVE:   'En cours',
  BREAK:    'Pause',
  ENDED:    'Terminé',
}

const TimelineItem = ({ startTime, endTime, label, state = 'UPCOMING', index = 0 }) => {
  const cfg = STATE_CONFIG[state] || STATE_CONFIG.UPCOMING

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.06 }}
      className="flex gap-4"
    >
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className={cn('h-3 w-3 flex-shrink-0 rounded-full mt-3.5', cfg.dot)} />
        <div className="mt-1 w-px flex-1 min-h-6 bg-surface-200 dark:bg-dark-600" />
      </div>

      {/* Card */}
      <div className={cn(
        'mb-3 flex-1 rounded-xl border px-4 py-3 transition-all duration-200',
        cfg.card
      )}>
        <div className="flex items-center justify-between gap-2">
          {/* Time range */}
          <span className={cn('text-xs font-mono', cfg.time)}>
            {startTime} {endTime ? `– ${endTime}` : ''}
          </span>

          {/* State badge */}
          <span className={cn(
            'rounded-full px-2 py-0.5 text-2xs font-semibold',
            cfg.badge
          )}>
            {STATE_LABELS[state]}
          </span>
        </div>

        {/* Label */}
        <p className={cn('mt-1 text-sm', cfg.label)}>
          {label}
        </p>
      </div>
    </motion.div>
  )
}

export default TimelineItem