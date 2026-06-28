import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchPlanningStatsThunk } from '../../features/planning/planningStatsSlice'
import {
  selectStatsData,
  selectStatsLoading,
  selectStatsError,
} from '../../features/planning/planningStatsSelectors'
import { clearStats } from '../../features/planning/planningStatsSlice'
import { Button, Skeleton, Badge, Tooltip } from '../ui'
import {
  BarChart3, Users, Clock, AlertTriangle, Zap, TrendingDown,
  X, RefreshCw, Target, Calendar,
} from 'lucide-react'
import { cn } from '../../utils/cn'

const StatCard = ({ label, value, icon: Icon, color, subtitle }) => (
  <div className={cn(
    'flex items-center gap-3 rounded-xl border p-3',
    'border-surface-100 bg-white dark:border-dark-600 dark:bg-dark-700'
  )}>
    <div className={cn(
      'flex h-9 w-9 items-center justify-center rounded-lg',
      color
    )}>
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{value}</p>
      {subtitle && <p className="text-2xs text-slate-400">{subtitle}</p>}
    </div>
  </div>
)

const StatisticsPanel = ({ weekNumber, year, open, onClose }) => {
  const dispatch = useDispatch()
  const stats = useSelector(selectStatsData)
  const loading = useSelector(selectStatsLoading)
  const error = useSelector(selectStatsError)

  useEffect(() => {
    if (open && weekNumber && year) {
      dispatch(fetchPlanningStatsThunk({ week_number: weekNumber, year }))
    }
    return () => {
      if (!open) dispatch(clearStats())
    }
  }, [open, weekNumber, year, dispatch])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-dark-600 dark:bg-dark-800">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-brand-500" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Statistiques du planning
                </span>
                <span className="text-2xs text-slate-400">
                  Semaine {weekNumber}/{year}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Tooltip content="Actualiser">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => dispatch(fetchPlanningStatsThunk({ week_number: weekNumber, year }))}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </Tooltip>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={onClose}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton.Block key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-sm text-red-600 py-4">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            ) : !stats ? null : (
              <div className="space-y-4">
                {/* Key metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard
                    label="Couverture"
                    value={`${stats.coverage_percentage}%`}
                    icon={Target}
                    color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    subtitle={`${stats.total_assignments} assignations`}
                  />
                  <StatCard
                    label="Employés planifiés"
                    value={`${stats.employees_planned}/${stats.total_employees}`}
                    icon={Users}
                    color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    subtitle={`${stats.employees_missing} manquant(s)`}
                  />
                  <StatCard
                    label="Heures totales"
                    value={`${stats.total_hours}h`}
                    icon={Clock}
                    color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                  />
                  <StatCard
                    label="Heures sup."
                    value={String(stats.overtime_forecast.count)}
                    icon={Zap}
                    color={stats.overtime_forecast.count > 0
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-surface-100 text-slate-400 dark:bg-dark-600'}
                    subtitle={stats.overtime_forecast.count > 0 ? 'Employés en dépassement' : 'Aucun dépassement'}
                  />
                </div>

                {/* Coverage by day */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Couverture par jour
                  </p>
                  <div className="grid grid-cols-7 gap-2">
                    {stats.coverage_by_day?.map((day) => (
                      <Tooltip key={day.date} content={`${day.assigned}/${day.total_employees} employés`}>
                        <div className={cn(
                          'flex flex-col items-center rounded-lg border p-2 text-center cursor-default',
                          day.coverage_percentage >= 75
                            ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10'
                            : day.coverage_percentage >= 50
                              ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10'
                              : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
                        )}>
                          <span className="text-2xs font-medium text-slate-500 dark:text-slate-400">
                            {day.day_name?.slice(0, 3)}
                          </span>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {day.coverage_percentage}%
                          </span>
                          <span className="text-2xs text-slate-400">
                            {day.assigned}/{day.total_employees}
                          </span>
                        </div>
                      </Tooltip>
                    ))}
                  </div>
                </div>

                {/* Overtime employees */}
                {stats.overtime_forecast?.employees?.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-500">
                      Employés en heures supplémentaires
                    </p>
                    <div className="space-y-1.5">
                      {stats.overtime_forecast.employees.slice(0, 5).map((emp) => (
                        <div key={emp.id} className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-xs dark:bg-amber-900/10">
                          <span className="font-medium text-amber-800 dark:text-amber-300">{emp.name}</span>
                          <span className="text-amber-600 dark:text-amber-400">
                            {emp.hours}h / {emp.limit}h (+{emp.overtime}h)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Under-utilized employees */}
                {stats.under_utilized?.employees?.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-500">
                      Employés sous-utilisés (&lt;32h)
                    </p>
                    <div className="space-y-1.5">
                      {stats.under_utilized.employees.slice(0, 5).map((emp) => (
                        <div key={emp.id} className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 text-xs dark:bg-blue-900/10">
                          <span className="font-medium text-blue-800 dark:text-blue-300">{emp.name}</span>
                          <span className="text-blue-600 dark:text-blue-400">{emp.hours}h / {emp.limit}h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shift distribution */}
                {stats.shift_distribution?.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Répartition des shifts
                    </p>
                    <div className="space-y-1.5">
                      {stats.shift_distribution.map((s) => (
                        <div key={s.shift_id} className="flex items-center gap-3 rounded-lg border border-surface-100 px-3 py-2 text-xs dark:border-dark-600">
                          <div className="flex-1 font-medium text-slate-700 dark:text-slate-200">{s.shift_name}</div>
                          <div className="text-slate-400">{s.count} assignation(s)</div>
                          <div className="w-16 text-right font-semibold text-slate-600 dark:text-slate-300">{s.percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default StatisticsPanel
