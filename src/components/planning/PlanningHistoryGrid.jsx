import { useSelector } from 'react-redux'
import { motion }      from 'framer-motion'
import ReadOnlyDayColumn from './ReadOnlyDayColumn'
import { Skeleton, EmptyState } from '../ui'
import {
  selectHistoryByDate,
  selectHistoryLoading,
  selectHistoryError,
} from '../../features/planning/planningSelectors'
import { Archive } from 'lucide-react'
import { ErrorState } from '../ui'
import { cn }         from '../../utils/cn'

/**
 * PlanningHistoryGrid — read-only weekly grid for planning history.
 *
 * Same 7-column structure as PlanningGrid.
 * No drag, no add, no drawer, no delete.
 * All cards show lock icon.
 *
 * Data from GET /v1/planning?week_number=&year= (same endpoint as live).
 */
const PlanningHistoryGrid = ({ days = [], onRetry, className }) => {
  const historyByDate = useSelector(selectHistoryByDate)
  const loading       = useSelector(selectHistoryLoading)
  const error         = useSelector(selectHistoryError)

  if (loading) {
    return (
      <div className="grid grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton.Block className="h-16 rounded-xl" />
            <Skeleton.Block className="h-20 rounded-xl" />
            <Skeleton.Block className="h-20 rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />
  }

  const totalRecords = Object.values(historyByDate)
    .reduce((sum, arr) => sum + arr.length, 0)

  if (totalRecords === 0) {
    return (
      <EmptyState
        icon={Archive}
        title="Aucun planning pour cette semaine"
        description="Cette semaine n'a pas de planning enregistré ou n'a pas encore été verrouillée."
        size="lg"
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn('overflow-x-auto pb-4', className)}
    >
      {/* Read-only notice */}
      <div className="mb-4 flex items-center gap-2 rounded-xl
                      border border-amber-200 bg-amber-50 px-4 py-2.5
                      dark:border-amber-800 dark:bg-amber-900/10">
        <span className="text-amber-500 text-sm">🔒</span>
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Ce planning est verrouillé et archivé. Aucune modification n'est possible.
        </p>
      </div>

      <div className="grid min-w-[896px] grid-cols-7 gap-3">
        {days.map((day) => (
          <ReadOnlyDayColumn
            key={day.date}
            day={day}
            plannings={historyByDate[day.date] || []}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default PlanningHistoryGrid