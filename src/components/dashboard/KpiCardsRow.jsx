import {
  Users, Clock, FileText, AlertTriangle,
  TrendingUp, PauseCircle,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  selectStats, selectStatsLoading,
  selectCoveragePct, selectPresentNow,
  selectTotalEmployees, selectDelaysToday,
  selectPendingLeaves,
  selectActivePausesCount, selectTodayAssignments,
  selectOvertimes,
} from '../../features/dashboard/dashboardSelectors'

import { StatCard } from '../ui'

/**
 * KpiCardsRow — 6 KPI cards for the admin dashboard top row.
 *
 * Data sources:
 *   - coverage.percentage  → GET /v1/dashboard/stats
 *   - coverage.present_now → stats (currently checked in)
 *   - delays_today         → stats
 *   - pending_leaves       → stats
 *   - overtimes            → stats (weekly aggregate)
 *   - active pauses count  → GET /v1/dashboard/active-pauses
 *   - today_assignments    → stats
 */
const KpiCardsRow = () => {
  const loading        = useSelector(selectStatsLoading)
  const coveragePct    = useSelector(selectCoveragePct)
  const presentNow     = useSelector(selectPresentNow)
  const totalEmp       = useSelector(selectTotalEmployees)
  const delays         = useSelector(selectDelaysToday)
  const pendingLeaves  = useSelector(selectPendingLeaves)
  const pauseCount     = useSelector(selectActivePausesCount)
  const todayAssign    = useSelector(selectTodayAssignments)
  const overtimes      = useSelector(selectOvertimes)

  const cards = [
    {
      label:      'Couverture Aujourd\'hui',
      value:      `${coveragePct}%`,
      sublabel:   `${totalEmp} employés actifs`,
      icon:       TrendingUp,
      iconBg:     coveragePct >= 80
        ? 'bg-emerald-50 dark:bg-emerald-900/20'
        : 'bg-amber-50 dark:bg-amber-900/20',
      iconColor:  coveragePct >= 80
        ? 'text-emerald-500 dark:text-emerald-400'
        : 'text-amber-500 dark:text-amber-400',
    },
    {
      label:     'Présents Maintenant',
      value:     presentNow,
      sublabel:  'en cours de service',
      icon:      Users,
      iconBg:    'bg-brand-50 dark:bg-brand-900/20',
      iconColor: 'text-brand-500 dark:text-brand-400',
    },
    {
      label:     'Retards Aujourd\'hui',
      value:     delays,
      sublabel:  delays === 0 ? 'Aucun retard' : 'à traiter',
      icon:      Clock,
      iconBg:    delays > 0
        ? 'bg-amber-50 dark:bg-amber-900/20'
        : 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: delays > 0
        ? 'text-amber-500 dark:text-amber-400'
        : 'text-emerald-500 dark:text-emerald-400',
    },
    {
      label:     'Congés en Attente',
      value:     pendingLeaves,
      sublabel:  pendingLeaves === 1 ? 'demande' : 'demandes',
      icon:      FileText,
      iconBg:    pendingLeaves > 0
        ? 'bg-violet-50 dark:bg-violet-900/20'
        : 'bg-slate-50 dark:bg-dark-600',
      iconColor: pendingLeaves > 0
        ? 'text-violet-500 dark:text-violet-400'
        : 'text-slate-400',
    },
    {
      label:     'Pauses Actives',
      value:     pauseCount,
      sublabel:  'en ce moment',
      icon:      PauseCircle,
      iconBg:    'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-500 dark:text-blue-400',
    },
    {
      label:     'Heures Supplémentaires',
      value:     overtimes,
      sublabel:  overtimes === 1 ? 'employé' : 'employés',
      icon:      AlertTriangle,
      iconBg:    overtimes > 0
        ? 'bg-amber-50 dark:bg-amber-900/20'
        : 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: overtimes > 0
        ? 'text-amber-500 dark:text-amber-400'
        : 'text-emerald-500 dark:text-emerald-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <StatCard
            loading={loading}
            label={card.label}
            value={card.value}
            sublabel={card.sublabel}
            icon={card.icon}
            iconBg={card.iconBg}
            iconColor={card.iconColor}
          />
        </motion.div>
      ))}
    </div>
  )
}

export default KpiCardsRow