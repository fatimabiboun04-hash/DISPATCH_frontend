import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import PlanningCard from './PlanningCard'
import { Tooltip }  from '../ui'
import { cn }       from '../../utils/cn'

/**
 * DayColumn — one day column in the weekly planning grid.
 *
 * day: { date, label, dayNum, month, isToday, isWeekend }
 * plannings: array of planning records for this day
 *
 * Shows: sticky day header + planning cards stack + add button.
 * Locked: add button hidden when all records are locked.
 */
const DayColumn = ({
  day,
  plannings   = [],
  onCardClick,
  onCardDelete,
  onAddClick,
  isWeekLocked = false,
  className,
}) => {
  const hasPlanning = plannings.length > 0

  return (
    <div className={cn(
      'flex min-w-0 flex-col gap-2',
      className
    )}>
      {/* Day header */}
      <div className={cn(
        'sticky top-0 z-10 flex flex-col items-center justify-center',
        'rounded-xl px-2 py-3 transition-colors duration-150',
        day.isToday
          ? 'bg-brand-500 text-white shadow-glow-sm'
          : day.isWeekend
            ? 'bg-surface-100 text-slate-400 dark:bg-dark-600'
            : 'bg-surface-50 text-slate-600 dark:bg-dark-700 dark:text-slate-300'
      )}>
        <span className="text-xs font-semibold uppercase tracking-wider">
          {day.label}
        </span>
        <span className={cn(
          'text-xl font-bold leading-none mt-0.5',
          day.isToday ? 'text-white' : 'text-slate-800 dark:text-slate-100'
        )}>
          {day.dayNum}
        </span>
        <span className={cn(
          'text-2xs mt-0.5 capitalize',
          day.isToday ? 'text-white/70' : 'text-slate-400'
        )}>
          {day.month}
        </span>
      </div>

      {/* Planning cards */}
      <div className="flex flex-col gap-2 flex-1 min-h-16">
        {plannings.map((planning, i) => (
          <PlanningCard
            key={planning.id}
            planning={planning}
            index={i}
            onClick={onCardClick}
            onDelete={onCardDelete}
          />
        ))}
      </div>

      {/* Add button */}
      {!isWeekLocked && (
        <Tooltip content={`Ajouter au ${day.label} ${day.dayNum}`}>
          <button
            onClick={() => onAddClick?.(day)}
            className={cn(
              'flex w-full items-center justify-center rounded-xl border',
              'border-dashed py-2.5 text-xs transition-all duration-150',
              hasPlanning
                ? 'border-surface-200 text-slate-300 hover:border-brand-300 hover:text-brand-500 dark:border-dark-500 dark:text-dark-400'
                : 'border-surface-300 text-slate-400 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 dark:border-dark-500 dark:hover:border-brand-600 dark:hover:bg-brand-900/10'
            )}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </Tooltip>
      )}
    </div>
  )
}

export default DayColumn