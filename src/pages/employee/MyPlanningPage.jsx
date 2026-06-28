import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion }        from 'framer-motion'
import axiosInstance     from '../../services/axiosInstance'
import { API }           from '../../constants/apiRoutes'
import TimelineView      from '../../components/planning/TimelineView'
import EmployeePauseList from '../../components/planning/EmployeePauseList'
import WeekSelector      from '../../components/planning/WeekSelector'
import { Tabs, Skeleton, ErrorState } from '../../components/ui'
import { usePlanning }   from '../../hooks/usePlanning'

/**
 * MyPlanningPage — /employee/my-planning
 *
 * Per spec:
 * "Simple execution view. They only need to know:
 *  What to do now / What comes next / When breaks occur / When the shift ends"
 *
 * Layout:
 *   Week selector → Day tabs (Mon-Sun) → Vertical timeline → Pause list
 *
 * Data:
 *   GET /v1/me/planning?week_number=&year=
 *   Returns PLAIN ARRAY (not paginated), loads shift only.
 *   orderBy('date') — already sorted.
 *
 * No admin complexity — mobile-first, no tables, no analytics.
 */

const DAY_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const MyPlanningPage = () => {
  const [weekDate,     setWeekDate]     = useState(new Date())
  const [plannings,    setPlannings]    = useState([])
  const [pauses,       setPauses]       = useState({})
  const [loadingPlan,  setLoadingPlan]  = useState(false)
  const [planError,    setPlanError]    = useState(null)
  const [activeDay,    setActiveDay]    = useState(
    new Date().toISOString().split('T')[0]  // today
  )

  const {
    days,
    weekNum,
    year,
    weekLabel,
    goToNextWeek,
    goToPrevWeek,
    goToCurrentWeek,
  } = usePlanning(weekDate, setWeekDate)

  // Fetch planning when week changes
  const fetchPlanning = useCallback(async (wn, yr) => {
    setLoadingPlan(true)
    setPlanError(null)
    try {
      const res = await axiosInstance.get(API.ME.PLANNING, {
        params: { week_number: wn, year: yr },
      })
      setPlannings(res.data.data || [])
    } catch {
      setPlannings([])
      setPlanError('Impossible de charger le planning')
    } finally {
      setLoadingPlan(false)
    }
  }, [])

  useEffect(() => {
    fetchPlanning(weekNum, year)
  }, [weekNum, year, fetchPlanning])

  // Fetch pauses for all plannings in a single batch request
  useEffect(() => {
    if (!plannings.length) {
      setPauses({})
      return
    }

    const abortController = new AbortController()
    const planningIds = plannings.map((p) => p.id)

    const fetchBatch = async () => {
      try {
        const res = await axiosInstance.get(API.PAUSES.BATCH, {
          params: { planning_ids: planningIds.join(',') },
          signal: abortController.signal,
        })
        if (!abortController.signal.aborted) {
          setPauses(res.data.data || {})
        }
      } catch (err) {
        if (err.name !== 'CanceledError' && !abortController.signal.aborted) {
          setPauses({})
        }
      }
    }

    fetchBatch()
    return () => abortController.abort()
  }, [plannings])

  // Filter plannings for the active day
  const todayPlannings = plannings.filter((p) => p.date === activeDay)

  // Get pauses for today's plannings
  const todayPauses = todayPlannings.flatMap((p) => pauses[p.id] || [])

  const dayTabs = useMemo(() =>
    days.map((day) => ({
      value:  day.date,
      label:  `${day.label} ${day.dayNum}`,
      count:  plannings.filter((p) => p.date === day.date).length || undefined,
    })),
    [days, plannings]
  )

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Mon Planning
        </h1>
        <p className="mt-0.5 text-sm text-slate-400">
          Votre programme de la semaine
        </p>
      </motion.div>

      {/* Week selector */}
      <WeekSelector
        weekLabel={weekLabel}
        onPrev={goToPrevWeek}
        onNext={goToNextWeek}
        onToday={goToCurrentWeek}
      />

      {/* Day tabs */}
      <Tabs
        tabs={dayTabs}
        value={activeDay}
        onChange={setActiveDay}
        variant="pill"
      />

      {/* Error state */}
      {planError && (
        <ErrorState message={planError} onRetry={() => fetchPlanning(weekNum, year)} />
      )}

      {/* Timeline */}
      <motion.div
        key={activeDay}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {loadingPlan ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton.Circle size="h-3 w-3 mt-3.5" />
                <Skeleton.Block className="flex-1 h-16 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <TimelineView
            plannings={todayPlannings}
            pauses={todayPauses}
            selectedDate={activeDay}
          />
        )}
      </motion.div>

      {/* Pause list */}
      {todayPauses.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <EmployeePauseList pauses={todayPauses} />
        </motion.div>
      )}
    </div>
  )
}

export default MyPlanningPage