import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Clock, Sun, Moon, Coffee, AlertTriangle } from 'lucide-react'
import employeePlanningService from '../../services/employeePlanningService'
import EmployeePlanningCard from '../../components/planning/EmployeePlanningCard'
import WeekSelector from '../../components/planning/WeekSelector'
import { Tabs, Skeleton, EmptyState } from '../../components/ui'
import { usePlanning } from '../../hooks/usePlanning'

const POLL_INTERVAL = 30000

const formatDuration = (hours) => {
  if (!hours && hours !== 0) return '0h'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h${m}`
}

const MyPlanningPage = () => {
  const [weekDate, setWeekDate] = useState(new Date())
  const [plannings, setPlannings] = useState([])
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [planError, setPlanError] = useState(null)
  const [activeDay, setActiveDay] = useState(
    new Date().toISOString().split('T')[0]
  )

  const {
    days, weekNum, year, weekLabel,
    goToNextWeek, goToPrevWeek, goToCurrentWeek, isCurrentWeek,
  } = usePlanning(weekDate, setWeekDate)

  const fetchPlanning = useCallback(async (wn, yr) => {
    setLoadingPlan(true)
    setPlanError(null)
    try {
      const res = await employeePlanningService.getMyPlanning({ week_number: wn, year: yr })
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

  // Auto-refresh polling
  useEffect(() => {
    if (!isCurrentWeek) return
    const interval = setInterval(() => {
      fetchPlanning(weekNum, year)
    }, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [isCurrentWeek, weekNum, year, fetchPlanning])

  const todayPlannings = plannings.filter((p) => p.date === activeDay)

  // Daily hours
  const dailyHours = useMemo(() => {
    return todayPlannings.reduce((total, p) => {
      return total + (p.duration_hours || 0)
    }, 0)
  }, [todayPlannings])

  // Weekly stats
  const weeklyStats = useMemo(() => {
    let totalHours = 0
    let shiftCount = 0
    let pastCount = 0
    const todayStr = new Date().toISOString().split('T')[0]

    plannings.forEach((p) => {
      totalHours += p.duration_hours || 0
      shiftCount++
      if (p.date < todayStr) pastCount++
    })

    const overtime = Math.max(0, totalHours - 44)

    return { totalHours: Math.round(totalHours * 10) / 10, shiftCount, pastCount, overtime }
  }, [plannings])

  const dayTabs = useMemo(() =>
    days.map((day) => ({
      value: day.date,
      label: `${day.label} ${day.dayNum}`,
      count: plannings.filter((p) => p.date === day.date).length || undefined,
    })),
    [days, plannings]
  )

  const isToday = activeDay === new Date().toISOString().split('T')[0]

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto pb-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Mon Planning</h1>
        <p className="mt-0.5 text-sm text-slate-400">Votre programme de la semaine</p>
      </motion.div>

      <WeekSelector
        weekLabel={weekLabel}
        onPrev={goToPrevWeek}
        onNext={goToNextWeek}
        onToday={goToCurrentWeek}
      />

      {/* Weekly summary bar */}
      {plannings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5
                     dark:border-dark-600 dark:bg-dark-800"
        >
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {formatDuration(weeklyStats.totalHours)}
            </span>
            <span className="text-2xs text-slate-400">/ semaine</span>
          </div>
          <span className="text-slate-200 dark:text-dark-500">|</span>
          <span className="text-xs text-slate-500">
            {weeklyStats.shiftCount} shift{weeklyStats.shiftCount > 1 ? 's' : ''}
          </span>
          <span className="text-slate-200 dark:text-dark-500">|</span>
          <span className="text-xs text-slate-500">
            {weeklyStats.pastCount} terminé{weeklyStats.pastCount > 1 ? 's' : ''}
          </span>
          {weeklyStats.overtime > 0 && (
            <>
              <span className="text-slate-200 dark:text-dark-500">|</span>
              <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3 w-3" />
                {formatDuration(weeklyStats.overtime)} supp.
              </span>
            </>
          )}
        </motion.div>
      )}

      <Tabs
        tabs={dayTabs}
        value={activeDay}
        onChange={setActiveDay}
        variant="pill"
      />

      {/* Daily hours indicator */}
      {todayPlannings.length > 0 && (
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {isToday ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            <span>
              {todayPlannings.length} assignation{todayPlannings.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="h-3 w-3 text-slate-400" />
            <span className="font-medium text-slate-600 dark:text-slate-300">
              {formatDuration(dailyHours)}
            </span>
            <span className="text-slate-400">aujourd'hui</span>
          </div>
        </div>
      )}

      {/* Error */}
      {planError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/10">
          <p className="text-xs text-red-600 dark:text-red-400">{planError}</p>
        </div>
      )}

      {/* Planning cards */}
      <motion.div
        key={activeDay}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {loadingPlan ? (
          <div className="space-y-3">
            {Array.from({ length: todayPlannings.length || 2 }).map((_, i) => (
              <Skeleton.Block key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : todayPlannings.length > 0 ? (
          <div className="space-y-2">
            {todayPlannings.map((p, i) => (
              <EmployeePlanningCard key={p.id} planning={p} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Clock}
            title="Aucune assignation"
            description="Vous n'avez pas de planning pour cette journée."
            size="sm"
          />
        )}
      </motion.div>

      {/* Pause info inline */}
      {todayPlannings.some((p) => p.pauses?.length > 0) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/10">
          <div className="flex items-center gap-1.5 mb-1">
            <Coffee className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-2xs font-semibold uppercase tracking-wider text-amber-600">Pauses</span>
          </div>
          {todayPlannings.map((p) =>
            (p.pauses || []).map((pause, i) => (
              <div key={i} className="flex items-center justify-between py-1 text-xs">
                <span className="text-slate-600">
                  {pause.pause_start} – {pause.pause_end}
                </span>
                <span className="text-slate-400">
                  {pause.duration_minutes || '-'}min
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Auto-refresh indicator */}
      {isCurrentWeek && plannings.length > 0 && (
        <p className="text-center text-2xs text-slate-400">
          Mise à jour automatique toutes les 30 secondes
        </p>
      )}
    </div>
  )
}

export default MyPlanningPage
