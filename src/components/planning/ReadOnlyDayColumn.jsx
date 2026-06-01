import ReadOnlyPlanningCard from './ReadOnlyPlanningCard'
import { cn }               from '../../utils/cn'

/**
 * ReadOnlyDayColumn — history version of DayColumn.
 * No add button, no drag, no interaction.
 * Same visual structure — aligned with live planning grid.
 */
const ReadOnlyDayColumn = ({ day, plannings = [] }) => (
  <div className="flex min-w-0 flex-col gap-2">
    {/* Day header — no "today" highlight in history */}
    <div className={cn(
      'flex flex-col items-center justify-center rounded-xl px-2 py-3',
      day.isWeekend
        ? 'bg-surface-100 text-slate-400 dark:bg-dark-600'
        : 'bg-surface-50 text-slate-600 dark:bg-dark-700 dark:text-slate-300'
    )}>
      <span className="text-xs font-semibold uppercase tracking-wider">
        {day.label}
      </span>
      <span className="text-xl font-bold leading-none mt-0.5
                       text-slate-800 dark:text-slate-100">
        {day.dayNum}
      </span>
      <span className="text-2xs mt-0.5 capitalize text-slate-400">
        {day.month}
      </span>
    </div>

    {/* Planning cards — read-only */}
    <div className="flex flex-col gap-2 flex-1 min-h-10">
      {plannings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-200
                        p-3 dark:border-dark-600">
          <p className="text-center text-2xs text-slate-300 dark:text-slate-600">
            —
          </p>
        </div>
      ) : (
        plannings.map((planning, i) => (
          <ReadOnlyPlanningCard
            key={planning.id}
            planning={planning}
            index={i}
          />
        ))
      )}
    </div>
  </div>
)

export default ReadOnlyDayColumn