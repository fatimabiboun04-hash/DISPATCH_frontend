import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, AlertTriangle, CheckCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

const STATUS_CONFIG = {
  empty:    { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-800', label: 'Aucun' },
  low:      { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-200 dark:border-amber-800', label: 'Faible' },
  adequate: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10', border: 'border-emerald-200 dark:border-emerald-800', label: 'OK' },
}

const CoveragePanel = ({ coverage = [], className }) => {
  const summary = useMemo(() => {
    if (!coverage.length) return null
    const totalSlots = coverage.reduce((sum, d) => sum + d.shifts.length, 0)
    const emptySlots = coverage.reduce((sum, d) => sum + d.shifts.filter((s) => s.status === 'empty').length, 0)
    const lowSlots = coverage.reduce((sum, d) => sum + d.shifts.filter((s) => s.status === 'low').length, 0)
    return { totalSlots, emptySlots, lowSlots, coverageRate: totalSlots > 0 ? ((totalSlots - emptySlots - lowSlots) / totalSlots) * 100 : 0 }
  }, [coverage])

  if (!coverage?.length) return null

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Couverture planning
        </p>
        {summary && (
          <span className={cn(
            'text-xs font-bold',
            summary.coverageRate >= 80 ? 'text-emerald-500' : summary.coverageRate >= 60 ? 'text-amber-500' : 'text-red-500'
          )}>
            {Math.round(summary.coverageRate)}%
          </span>
        )}
      </div>

      <div className="space-y-2">
        {coverage.map((day) => {
          const hasIssues = day.shifts.some((s) => s.status !== 'adequate')
          return (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={cn(
                'rounded-lg border p-2.5',
                hasIssues ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/10' : 'border-surface-100 bg-white dark:border-dark-600 dark:bg-dark-700'
              )}
            >
              <p className="mb-1.5 text-2xs font-medium text-slate-500 dark:text-slate-400">
                {day.day_name} — {day.date}
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {day.shifts.map((shift) => {
                  const cfg = STATUS_CONFIG[shift.status] || STATUS_CONFIG.adequate
                  const Icon = cfg.icon
                  return (
                    <div key={shift.shift_id} className={cn('flex items-center gap-1.5 rounded-md border px-2 py-1.5', cfg.bg, cfg.border)}>
                      <Icon className={cn('h-3 w-3 flex-shrink-0', cfg.color)} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-2xs font-medium text-slate-700 dark:text-slate-200">{shift.shift_name}</p>
                        <p className={cn('text-2xs font-semibold', cfg.color)}>{shift.count} {cfg.label}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default CoveragePanel
