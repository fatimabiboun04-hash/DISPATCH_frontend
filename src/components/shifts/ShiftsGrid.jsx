import { Clock } from 'lucide-react'
import ShiftCard   from './ShiftCard'
import { EmptyState, ErrorState, Skeleton } from '../ui'

/**
 * ShiftsGrid — responsive card grid for shift definitions.
 *
 * No pagination — GET /v1/shifts returns all shifts at once (not paginated).
 * Separates active from inactive shifts into two sections.
 */
const ShiftsGrid = ({
  shifts        = [],
  loading       = false,
  error         = null,
  showInactive  = false,
  onRetry,
  onEdit,
  onDeactivate,
  onToggleActive,
}) => {

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}
               className="rounded-2xl border border-surface-200 bg-white p-5
                          dark:border-dark-600 dark:bg-dark-700">
            {/* Color bar */}
            <div className="shimmer mb-4 h-1.5 w-full rounded-full" />
            <div className="mb-3 flex items-center justify-between">
              <Skeleton.Block className="h-5 w-16 rounded-full" />
              <Skeleton.Block className="h-7 w-7 rounded-lg" />
            </div>
            <Skeleton.Line width="w-36" height="h-4" className="mb-4" />
            <Skeleton.Block className="h-10 w-full rounded-xl mb-3" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton.Block className="h-5 w-16 rounded-full" />
              <Skeleton.Block className="h-7 w-14 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />
  }

  const activeShifts   = shifts.filter((s) => s.is_active)
  const inactiveShifts = shifts.filter((s) => !s.is_active)

  if (activeShifts.length === 0 && !showInactive) {
    return (
      <EmptyState
        icon={Clock}
        title="Aucun shift actif"
        description="Créez votre premier shift pour commencer la planification."
        size="lg"
      />
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Active shifts */}
      {activeShifts.length > 0 && (
        <section>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider
                         text-slate-400">
            Shifts actifs
            <span className="ml-2 rounded-full bg-emerald-100 px-1.5 py-0.5
                             text-2xs font-bold text-emerald-600
                             dark:bg-emerald-900/30 dark:text-emerald-400">
              {activeShifts.length}
            </span>
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {activeShifts.map((shift, i) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                index={i}
                onEdit={onEdit}
                onDeactivate={onDeactivate}
                onToggleActive={onToggleActive}
              />
            ))}
          </div>
        </section>
      )}

      {/* Inactive shifts — only shown when toggle is on */}
      {showInactive && inactiveShifts.length > 0 && (
        <section>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider
                         text-slate-400">
            Shifts inactifs
            <span className="ml-2 rounded-full bg-slate-200 px-1.5 py-0.5
                             text-2xs font-bold text-slate-500
                             dark:bg-dark-500 dark:text-slate-400">
              {inactiveShifts.length}
            </span>
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {inactiveShifts.map((shift, i) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                index={i}
                onEdit={onEdit}
                onDeactivate={onDeactivate}
                onToggleActive={onToggleActive}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ShiftsGrid