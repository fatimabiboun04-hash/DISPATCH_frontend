import { Clock, TrendingUp, Coffee, ArrowLeft } from 'lucide-react'
import { formatTime, formatMinutesToHours } from '../../utils/formatters'
import { cn } from '../../utils/cn'

/**
 * TodaySummaryCard — shows today's work summary after check-in or check-out.
 *
 * Shows:
 * - Check-in time + scheduled start
 * - Check-out time + scheduled end (if checked out)
 * - Worked hours (from worked_minutes)
 * - Pause time deducted (from check-out response)
 * - Early leave or overtime minutes
 */
const TodaySummaryCard = ({ todayPointage, checkOutResult }) => {
  if (!todayPointage) return null

  const isCheckedOut = !!todayPointage.check_out_at
  const workedH = todayPointage.worked_minutes
    ? formatMinutesToHours(todayPointage.worked_minutes, true)
    : null

  const rows = [
    {
      icon:  Clock,
      label: 'Heure d\'entrée',
      value: formatTime(todayPointage.check_in_at),
      sub:   `Planifié: ${formatTime(todayPointage.scheduled_start)}`,
    },
    isCheckedOut && {
      icon:  ArrowLeft,
      label: 'Heure de sortie',
      value: formatTime(todayPointage.check_out_at),
      sub:   `Planifié: ${formatTime(todayPointage.scheduled_end)}`,
    },
    isCheckedOut && workedH && {
      icon:  TrendingUp,
      label: 'Heures travaillées',
      value: workedH,
      sub:   checkOutResult?.pause_deducted
        ? `Pause déduite: ${checkOutResult.pause_deducted.toFixed(1)}h`
        : undefined,
    },
    isCheckedOut && checkOutResult?.early_leave_minutes > 0 && {
      icon:  ArrowLeft,
      label: 'Sortie anticipée',
      value: `${checkOutResult.early_leave_minutes}min`,
      sub:   'Avant la fin du shift',
      color: 'text-amber-600 dark:text-amber-400',
    },
  ].filter(Boolean)

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5
                    dark:border-dark-600 dark:bg-dark-700">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider
                    text-slate-400">
        Résumé du jour
      </p>
      <div className="space-y-3">
        {rows.map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center
                            rounded-lg bg-surface-100 dark:bg-dark-600">
              <Icon className="h-4 w-4 text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500">{label}</p>
              <p className={cn('text-sm font-semibold', color || 'text-slate-800 dark:text-slate-100')}>
                {value}
              </p>
              {sub && <p className="text-2xs text-slate-400">{sub}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TodaySummaryCard