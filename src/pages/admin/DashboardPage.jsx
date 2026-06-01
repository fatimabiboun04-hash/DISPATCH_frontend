import { useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import {
  fetchStatsThunk,
  fetchLiveFeedThunk,
  fetchCoverageThunk,
  fetchActivePausesThunk,
} from '../../features/dashboard/dashboardThunks'
import { setLastRefreshed } from '../../features/dashboard/dashboardSlice'

import KpiCardsRow         from '../../components/dashboard/KpiCardsRow'
import CoverageGauge       from '../../components/dashboard/CoverageGauge'
import ActivityFeed        from '../../components/dashboard/ActivityFeed'
import ActivePausesWidget  from '../../components/dashboard/ActivePausesWidget'
import OverTimeAlertsPanel from '../../components/dashboard/OverTimeAlertsPanel'
import PendingLeaveWidget  from '../../components/dashboard/PendingLeaveWidget'
import WeeklyTrendChart    from '../../components/dashboard/WeeklyTrendChart'
import { Button } from '../../components/ui'

/**
 * DashboardPage — Admin Command Center.
 *
 * Layout:
 *   Row 1: KPI cards (6 across)
 *   Row 2: Coverage gauge (2 cols) | Activity feed (2 cols) | Alerts (1 col) + Leave (1 col)
 *   Row 3: Weekly trend chart (3 cols) | Active pauses (2 cols) | (future: predictive)
 *
 * Auto-refreshes all widgets every 60 seconds.
 * Manual refresh button available.
 */
const DashboardPage = () => {
  const dispatch = useDispatch()

  // Fetch all dashboard data in parallel
  const refreshAll = useCallback(() => {
    dispatch(fetchStatsThunk())
    dispatch(fetchLiveFeedThunk())
    dispatch(fetchCoverageThunk())
    dispatch(fetchActivePausesThunk())
    dispatch(setLastRefreshed())
  }, [dispatch])

  // Initial load
  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(refreshAll, 60_000)
    return () => clearInterval(interval)
  }, [refreshAll])

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

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          onClick={refreshAll}
        >
          Actualiser
        </Button>
      </motion.div>

      {/* Row 1 — KPI cards */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <KpiCardsRow />
      </motion.section>

      {/* Row 2 — Coverage + Activity + Alerts + Leave */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 gap-5 lg:grid-cols-12"
      >
        {/* Coverage gauge — 4 cols */}
        <div className="lg:col-span-4">
          <CoverageGauge />
        </div>

        {/* Activity feed — 4 cols */}
        <div className="lg:col-span-4" style={{ minHeight: '320px' }}>
          <ActivityFeed />
        </div>

        {/* Right column: alerts + pending leave — 4 cols */}
        <div className="flex flex-col gap-5 lg:col-span-4">
          <OverTimeAlertsPanel />
          <PendingLeaveWidget />
        </div>
      </motion.section>

      {/* Row 3 — Weekly trend + Active pauses */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="grid grid-cols-1 gap-5 lg:grid-cols-12"
      >
        {/* Weekly trend chart — 7 cols */}
        <div className="lg:col-span-7">
          <WeeklyTrendChart />
        </div>

        {/* Active pauses — 5 cols */}
        <div className="lg:col-span-5" style={{ minHeight: '280px' }}>
          <ActivePausesWidget />
        </div>
      </motion.section>

    </div>
  )
}

export default DashboardPage