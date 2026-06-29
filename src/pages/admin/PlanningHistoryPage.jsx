import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion }               from 'framer-motion'
import { subWeeks }             from 'date-fns'
import { usePlanningHistory }   from '../../hooks/usePlanningHistory'
import {
  selectHistoryData,
  selectHistoryLoading,
} from '../../features/planning/planningSelectors'
import { clearHistory } from '../../features/planning/planningSlice'
import HistoryWeekSelector  from '../../components/planning/HistoryWeekSelector'
import PlanningHistoryGrid  from '../../components/planning/PlanningHistoryGrid'
import PlanningExportBar    from '../../components/planning/PlanningExportBar'
import { Badge } from '../../components/ui'

/**
 * PlanningHistoryPage — /admin/planning-history (or used as a tab in HistoryPage)
 *
 * Shows past weekly plannings in read-only mode.
 * Starts at last week (current - 1) on mount.
 * Can navigate backward through any past week.
 * Cannot navigate into the future.
 *
 * Uses same GET /v1/planning endpoint with week_number + year.
 * All fetched records are displayed — no client-side is_locked filter needed
 * since past weeks should all be locked by the Friday workflow.
 */
const PlanningHistoryPage = () => {
  const dispatch = useDispatch()

  // Start at last week
  const [weekDate, setWeekDate] = useState(() => subWeeks(new Date(), 1))

  const {
    days,
    weekNum,
    year,
    weekLabel,
    fetchHistoryWeek,
    goToPrevWeek,
    goToNextWeek,
    canGoForward,
  } = usePlanningHistory(weekDate, setWeekDate)

  const historyData  = useSelector(selectHistoryData)
  const loading      = useSelector(selectHistoryLoading)

  // Fetch on mount (last week)
  useEffect(() => {
    fetchHistoryWeek(weekDate)
    return () => {
      dispatch(clearHistory())
    }
  }, []) // eslint-disable-line

  const handleRefetch = () => fetchHistoryWeek(weekDate)

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Historique Planning
          </h2>
          <p className="mt-0.5 text-sm text-slate-400">
            Plannings archivés — lecture seule
          </p>
        </div>

        {/* Export bar */}
        <PlanningExportBar weekLabel={weekLabel} />
      </motion.div>

      {/* Week selector + stats row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <HistoryWeekSelector
          weekLabel={weekLabel}
          onPrev={goToPrevWeek}
          onNext={goToNextWeek}
          canGoForward={canGoForward}
          lockedCount={historyData.length}
        />

        {/* Summary badges */}
        {!loading && historyData.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="default">
              {historyData.length} assignation{historyData.length > 1 ? 's' : ''}
            </Badge>
            <Badge variant="warning" dot>
              Semaine {weekNum}/{year}
            </Badge>
          </div>
        )}
      </div>

      {/* Read-only planning grid */}
      <PlanningHistoryGrid
        days={days}
        onRetry={handleRefetch}
      />

    </div>
  )
}

export default PlanningHistoryPage