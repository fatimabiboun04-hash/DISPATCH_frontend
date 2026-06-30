import { useEffect, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { RefreshCw, ChevronLeft, ChevronRight, Bell } from 'lucide-react'
import {
  fetchStatsThunk,
  fetchLiveFeedThunk,
  fetchCoverageThunk,
  fetchActivePausesThunk,
  fetchWeeklyHistoryThunk,
} from '../../features/dashboard/dashboardThunks'
import { setLastRefreshed } from '../../features/dashboard/dashboardSlice'
import {
  selectCurrentWeek, selectCurrentYear, selectNavigation,
  selectIsCurrentWeek, selectWeekLabel,
  selectStatsLoading,
} from '../../features/dashboard/dashboardSelectors'

import KpiCardsRow            from '../../components/dashboard/KpiCardsRow'
import CoverageGauge          from '../../components/dashboard/CoverageGauge'
import ActivityFeed           from '../../components/dashboard/ActivityFeed'
import ActivePausesWidget     from '../../components/dashboard/ActivePausesWidget'
import OverTimeAlertsPanel    from '../../components/dashboard/OverTimeAlertsPanel'
import PendingLeaveWidget     from '../../components/dashboard/PendingLeaveWidget'
import WeeklyTrendChart       from '../../components/dashboard/WeeklyTrendChart'
import ShiftDistributionChart from '../../components/dashboard/ShiftDistributionChart'
import TaskDistributionChart  from '../../components/dashboard/TaskDistributionChart'
import PauseDistributionChart from '../../components/dashboard/PauseDistributionChart'
import RatingsEvolutionChart  from '../../components/dashboard/RatingsEvolutionChart'
import HoursChart             from '../../components/dashboard/HoursChart'
import QuickActionsPanel      from '../../components/dashboard/QuickActionsPanel'
import KpiEngineRow           from '../../components/dashboard/KpiEngineRow'
import { Button, Badge } from '../../components/ui'

const DashboardPage = () => {
  const dispatch = useDispatch()
  const currentWeek = useSelector(selectCurrentWeek)
  const currentYear = useSelector(selectCurrentYear)
  const navigation  = useSelector(selectNavigation)
  const isCurrent   = useSelector(selectIsCurrentWeek)
  const weekLabel   = useSelector(selectWeekLabel)
  const loading     = useSelector(selectStatsLoading)

  const [week, setWeek]   = useState(null)
  const [year, setYear]   = useState(null)

  const weekParams = week && year ? { week_number: week, year } : {}

  const refreshAll = useCallback(() => {
    dispatch(fetchStatsThunk(weekParams))
    dispatch(fetchLiveFeedThunk())
    dispatch(fetchCoverageThunk(weekParams))
    dispatch(fetchActivePausesThunk())
    dispatch(fetchWeeklyHistoryThunk())
    dispatch(setLastRefreshed())
  }, [dispatch, week, year])

  // Initial load
  useEffect(() => {
    refreshAll()
  }, [week, year])

  // Sync week/year from API response
  useEffect(() => {
    if (currentWeek && week === null) setWeek(currentWeek)
    if (currentYear && year === null) setYear(currentYear)
  }, [currentWeek, currentYear])

  // Auto-refresh only on current week
  useEffect(() => {
    if (!isCurrent) return
    const interval = setInterval(refreshAll, 60_000)
    return () => clearInterval(interval)
  }, [refreshAll, isCurrent])

  const goPrevWeek = () => {
    if (!navigation) return
    setWeek(navigation.prev_week)
    setYear(navigation.prev_year)
  }

  const goNextWeek = () => {
    if (!navigation) return
    setWeek(navigation.next_week)
    setYear(navigation.next_year)
  }

  const goCurrentWeek = () => {
    setWeek(null)
    setYear(null)
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Tableau de Bord
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Vue d'ensemble des opérations en temps réel
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Week navigation */}
          <div className="flex items-center gap-1.5 rounded-xl border border-surface-200
                          bg-white px-3 py-1.5 dark:border-dark-600 dark:bg-dark-700">
            <button
              onClick={goPrevWeek}
              className="rounded-lg p-1 text-slate-400 hover:bg-surface-100
                         hover:text-slate-600 dark:hover:bg-dark-600 dark:hover:text-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[140px] text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
              {weekLabel}
            </span>
            <button
              onClick={goNextWeek}
              disabled={isCurrent}
              className="rounded-lg p-1 text-slate-400 hover:bg-surface-100
                         hover:text-slate-600 disabled:opacity-30
                         dark:hover:bg-dark-600 dark:hover:text-slate-300"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {!isCurrent && (
            <Button variant="ghost" size="sm" onClick={goCurrentWeek}>
              Semaine en cours
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={refreshAll}
          >
            Actualiser
          </Button>
        </div>
      </motion.div>

      {/* Row 1 — KPI cards */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <KpiCardsRow />
      </motion.section>

      {/* Row 2 — KPI Engine */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.07 }}
      >
        <KpiEngineRow />
      </motion.section>

      {/* Row 3 — Coverage + Activity + Alerts + Leave */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 gap-5 lg:grid-cols-12"
      >
        <div className="lg:col-span-4">
          <CoverageGauge />
        </div>
        <div className="lg:col-span-4" style={{ minHeight: '320px' }}>
          <ActivityFeed />
        </div>
        <div className="flex flex-col gap-5 lg:col-span-4">
          <OverTimeAlertsPanel />
          <PendingLeaveWidget />
        </div>
      </motion.section>

      {/* Row 4 — Charts (coverage + hours) */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="grid grid-cols-1 gap-5 lg:grid-cols-12"
      >
        <div className="lg:col-span-7">
          <WeeklyTrendChart />
        </div>
        <div className="lg:col-span-5">
          <HoursChart />
        </div>
      </motion.section>

      {/* Row 5 — Distribution Charts */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.18 }}
        className="grid grid-cols-1 gap-5 lg:grid-cols-12"
      >
        <div className="lg:col-span-3">
          <ShiftDistributionChart />
        </div>
        <div className="lg:col-span-3">
          <TaskDistributionChart />
        </div>
        <div className="lg:col-span-3">
          <PauseDistributionChart />
        </div>
        <div className="lg:col-span-3">
          <RatingsEvolutionChart />
        </div>
      </motion.section>

      {/* Row 6 — Quick Actions + Active Pauses */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid grid-cols-1 gap-5 lg:grid-cols-12"
      >
        <div className="lg:col-span-7">
          <QuickActionsPanel />
        </div>
        <div className="lg:col-span-5" style={{ minHeight: '280px' }}>
          <ActivePausesWidget />
        </div>
      </motion.section>

    </div>
  )
}

export default DashboardPage
