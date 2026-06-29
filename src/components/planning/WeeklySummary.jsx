import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  BarChart3, Users, Clock, AlertTriangle, Lock, Unlock,
  Target, TrendingDown,
} from 'lucide-react'
import {
  selectPlanningByDate,
  selectHasLockedRecords,
  selectLockedCount,
} from '../../features/planning/planningSelectors'
import { cn } from '../../utils/cn'

const SummaryItem = ({ label, value, icon: Icon, color, trend }) => (
  <div className="flex items-center gap-2 rounded-lg border border-surface-100 bg-white px-3 py-2 dark:border-dark-600 dark:bg-dark-700">
    <div className={cn('flex h-7 w-7 items-center justify-center rounded-md', color)}>
      <Icon className="h-3.5 w-3.5" />
    </div>
    <div className="min-w-0 leading-tight">
      <p className="text-2xs text-slate-400">{label}</p>
      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
    {trend && (
      <span className={cn(
        'text-2xs font-medium ml-auto',
        trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-red-500' : 'text-slate-400'
      )}>
        {trend > 0 ? '+' : ''}{trend}
      </span>
    )}
  </div>
)

const WeeklySummary = ({ weekNumber, year, stats }) => {
  const planningByDate = useSelector(selectPlanningByDate)
  const hasLocked = useSelector(selectHasLockedRecords)
  const lockedCount = useSelector(selectLockedCount)

  const totalAssignments = useMemo(() => {
    let count = 0
    for (const date in planningByDate) {
      count += planningByDate[date].length
    }
    return count
  }, [planningByDate])

  const weeklyHours = useMemo(() => {
    let hours = 0
    for (const date in planningByDate) {
      for (const p of planningByDate[date]) {
        hours += p.shift?.duration_hours || 0
      }
    }
    return hours
  }, [planningByDate])

  if (!stats) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-xs text-slate-400 dark:border-dark-600 dark:bg-dark-800">
        <BarChart3 className="h-3.5 w-3.5" />
        Chargement des statistiques…
      </div>
    )
  }

  const unlockedCount = totalAssignments - lockedCount

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 p-2.5 dark:border-dark-600 dark:bg-dark-800"
    >
      <SummaryItem
        label="Assignations"
        value={totalAssignments}
        icon={BarChart3}
        color="bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
      />
      <SummaryItem
        label="Employés planifiés"
        value={`${stats.employees_planned}/${stats.total_employees}`}
        icon={Users}
        color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
      />
      <SummaryItem
        label="Couverture"
        value={`${stats.coverage_percentage}%`}
        icon={Target}
        color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
      />
      {stats.employees_missing > 0 && (
        <SummaryItem
          label="Manquants"
          value={stats.employees_missing}
          icon={TrendingDown}
          color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
      )}
      <SummaryItem
        label="Heures"
        value={`${stats.total_hours}h`}
        icon={Clock}
        color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
      />
      {hasLocked && (
        <SummaryItem
          label="Verrouillées"
          value={lockedCount}
          icon={Lock}
          color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
      )}
      {unlockedCount > 0 && !hasLocked && (
        <SummaryItem
          label="Déverrouillées"
          value={unlockedCount}
          icon={Unlock}
          color="bg-surface-100 text-slate-500 dark:bg-dark-600"
        />
      )}
      {stats.overtime_forecast?.count > 0 && (
        <SummaryItem
          label="Heures sup."
          value={stats.overtime_forecast.count}
          icon={AlertTriangle}
          color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
        />
      )}
    </motion.div>
  )
}

export default WeeklySummary
