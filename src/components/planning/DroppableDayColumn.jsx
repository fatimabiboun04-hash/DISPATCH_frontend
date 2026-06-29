import { useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import DraggablePlanningCard from './DraggablePlanningCard'
import { Plus, Clock, Users } from 'lucide-react'
import { Tooltip } from '../ui'
import { cn } from '../../utils/cn'

const DroppableDayColumn = ({
  day,
  plannings   = [],
  pausesByPlanningId = {},
  onCardClick,
  onCardDelete,
  onAddClick,
  onRefresh,
  isWeekLocked = false,
}) => {
  const { isOver, setNodeRef } = useDroppable({ id: day.date })

  // Compute column summary
  const summary = useMemo(() => {
    const empCount = new Set(plannings.map((p) => p.user_id)).size
    const totalHours = plannings.reduce((acc, p) => acc + (p.shift?.duration_hours || 0), 0)
    const lockedCount = plannings.filter((p) => p.is_locked).length
    return { empCount, totalHours, lockedCount }
  }, [plannings])

  return (
    <div className="flex min-w-0 flex-col gap-2">
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

        {/* Column summary badges */}
        {plannings.length > 0 && (
          <div className={cn(
            'mt-2 flex items-center gap-2',
            day.isToday ? 'text-white/80' : 'text-slate-400'
          )}>
            <div className="flex items-center gap-0.5">
              <Users className="h-2.5 w-2.5" />
              <span className="text-2xs font-medium">{summary.empCount}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              <span className="text-2xs font-medium">{summary.totalHours}h</span>
            </div>
          </div>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-col gap-2 flex-1 min-h-16 rounded-xl',
          'transition-colors duration-150 p-0.5',
          isOver && 'bg-brand-50 ring-2 ring-brand-300 ring-dashed dark:bg-brand-900/10'
        )}
      >
        {plannings.map((planning, i) => (
          <DraggablePlanningCard
            key={planning.id}
            planning={planning}
            index={i}
            pauses={pausesByPlanningId[planning.id] || []}
            onClick={onCardClick}
            onDelete={onCardDelete}
            onRefresh={onRefresh}
          />
        ))}

        {/* Empty state */}
        {plannings.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-surface-200 dark:border-dark-500 min-h-[80px]">
            <span className="text-2xs text-slate-300 dark:text-slate-600">Glisser un employé</span>
          </div>
        )}
      </div>

      {/* Add button */}
      {!isWeekLocked && (
        <Tooltip content={`Ajouter au ${day.label} ${day.dayNum}`}>
          <button
            onClick={() => onAddClick?.(day)}
            className={cn(
              'flex w-full items-center justify-center rounded-xl border',
              'border-dashed py-2.5 text-xs transition-all duration-150',
              plannings.length > 0
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

export default DroppableDayColumn
