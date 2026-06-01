import { useEffect, useState }       from 'react'
import { useDispatch, useSelector }  from 'react-redux'
import { motion }                    from 'framer-motion'
import { subWeeks, getISOWeek, getISOWeekYear } from 'date-fns'
import { Archive }                   from 'lucide-react'
import { fetchWeeklyHistoryThunk }   from '../../features/history/historyThunks'
import {
  selectWeeklyHistory,
  selectWeeklyHistoryLoading,
} from '../../features/history/historySelectors'
import { fetchPlanningHistoryThunk } from '../../features/planning/planningThunks'
import { setHistoryWeekInfo }        from '../../features/planning/planningSlice'
import { usePlanningHistory }        from '../../hooks/usePlanningHistory'
import WeekHistoryCard               from './WeekHistoryCard'
import PlanningHistoryGrid           from '../planning/PlanningHistoryGrid'
import { Skeleton, EmptyState }      from '../ui'

/**
 * DashboardHistoryView — weekly archive with planning grid drill-down.
 *
 * Shows week cards for past 8 weeks.
 * Clicking a card loads that week's read-only planning grid.
 *
 * No dedicated backend endpoint for dashboard history metrics.
 * Uses GET /v1/planning per week to get planning counts.
 */
const DashboardHistoryView = () => {
  const dispatch        = useDispatch()
  const weeklyHistory   = useSelector(selectWeeklyHistory)
  const loading         = useSelector(selectWeeklyHistoryLoading)
  const [selectedWeek,  setSelectedWeek] = useState(null)

  useEffect(() => {
    dispatch(fetchWeeklyHistoryThunk(8))
  }, [dispatch])

  // Auto-select most recent week
  useEffect(() => {
    if (weeklyHistory.length > 0 && !selectedWeek) {
      setSelectedWeek(weeklyHistory[0])
    }
  }, [weeklyHistory, selectedWeek])

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton.Block key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton.Block className="h-64 rounded-xl" />
      </div>
    )
  }

  if (weeklyHistory.length === 0) {
    return (
      <EmptyState
        icon={Archive}
        title="Aucun historique disponible"
        description="Les semaines passées apparaîtront ici au fur et à mesure."
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Week selector cards */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Semaines archivées
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {weeklyHistory.map((week, i) => (
            <WeekHistoryCard
              key={`${week.week_number}-${week.year}`}
              week={week}
              selected={
                selectedWeek?.week_number === week.week_number &&
                selectedWeek?.year        === week.year
              }
              onClick={() => setSelectedWeek(week)}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Planning grid for selected week */}
      {selectedWeek && (
        <motion.div
          key={`${selectedWeek.week_number}-${selectedWeek.year}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-surface-200 dark:bg-dark-600" />
            <p className="text-xs font-semibold text-slate-400 px-3">
              Planning archivé — {selectedWeek.weekLabel}
            </p>
            <div className="h-px flex-1 bg-surface-200 dark:bg-dark-600" />
          </div>
          <WeekPlanningPreview week={selectedWeek} />
        </motion.div>
      )}
    </div>
  )
}

/**
 * WeekPlanningPreview — loads and shows the read-only grid for one past week.
 */
const WeekPlanningPreview = ({ week }) => {
  const dispatch = useDispatch()

  // Compute the Date object for the given past week
  const weekDate = (() => {
    const now  = new Date()
    const diff = (getISOWeek(now) - week.week_number) +
                 (getISOWeekYear(now) - week.year) * 52
    return subWeeks(now, diff > 0 ? diff : 1)
  })()

  const [localWeekDate, setLocalWeekDate] = useState(weekDate)
  const { days } = usePlanningHistory(localWeekDate, setLocalWeekDate)

  useEffect(() => {
    dispatch(setHistoryWeekInfo({
      weekNumber: week.week_number,
      year:       week.year,
    }))
    dispatch(fetchPlanningHistoryThunk({
      week_number: week.week_number,
      year:        week.year,
    }))
  }, [week.week_number, week.year, dispatch])

  return <PlanningHistoryGrid days={days} />
}

export default DashboardHistoryView