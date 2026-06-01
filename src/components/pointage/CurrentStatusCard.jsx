import { motion } from 'framer-motion'
import { CheckCircle, Clock, AlertTriangle, LogIn, LogOut } from 'lucide-react'
import { formatTime, formatMinutesToHours } from '../../utils/formatters'
import { cn } from '../../utils/cn'

/**
 * CurrentStatusCard — shows the employee's current pointage state.
 *
 * States:
 * - Not checked in today → neutral / prompts to check in
 * - Checked in (on_time) → green
 * - Checked in (late)    → amber
 * - Checked in (flagged) → red with flag icon
 * - Checked out          → blue with worked hours summary
 *
 * todayPointage shape from Pointage model:
 *   { check_in_at, check_out_at, status, worked_minutes,
 *     delay_minutes, is_flagged, scheduled_start, scheduled_end }
 */
const STATUS_CONFIG = {
  on_time:     { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', icon: CheckCircle, label: 'À l\'heure' },
  late:        { color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-amber-200 dark:border-amber-800',   icon: Clock,        label: 'En retard' },
  flagged:     { color: 'text-red-600 dark:text-red-400',       bg: 'bg-red-50 dark:bg-red-900/20',       border: 'border-red-200 dark:border-red-800',       icon: AlertTriangle, label: 'Signalé' },
  early_leave: { color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-900/20',     border: 'border-blue-200 dark:border-blue-800',     icon: LogOut,        label: 'Sortie anticipée' },
}

const CurrentStatusCard = ({ todayPointage }) => {
  const isCheckedIn  = todayPointage && !todayPointage.check_out_at
  const isCheckedOut = todayPointage && !!todayPointage.check_out_at
  const status       = todayPointage?.status || 'on_time'
  const config       = STATUS_CONFIG[status] || STATUS_CONFIG.on_time
  const Icon         = config.icon

  if (!todayPointage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3 rounded-2xl border
                   border-surface-200 bg-white p-6 text-center
                   dark:border-dark-600 dark:bg-dark-700"
      >
        <div className="flex h-14 w-14 items-center justify-center
                        rounded-2xl bg-surface-100 dark:bg-dark-600">
          <LogIn className="h-7 w-7 text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Non pointé aujourd'hui
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            Cliquez sur "Je suis présent" pour enregistrer votre arrivée
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'rounded-2xl border p-5',
        config.bg, config.border
      )}
    >
      {/* Status header */}
      <div className="mb-4 flex items-center gap-3">
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl',
          config.bg
        )}>
          <Icon className={cn('h-5 w-5', config.color)} />
        </div>
        <div>
          <p className={cn('text-sm font-bold', config.color)}>
            {isCheckedIn  ? 'Présent' : 'Journée terminée'}
          </p>
          <p className={cn('text-xs', config.color, 'opacity-70')}>
            {config.label}
          </p>
        </div>
      </div>

      {/* Time details grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/50 px-3 py-2.5 dark:bg-dark-700/50">
          <p className="text-2xs text-slate-400 mb-0.5">Entrée</p>
          <p className={cn('text-sm font-bold', config.color)}>
            {formatTime(todayPointage.check_in_at)}
          </p>
          <p className="text-2xs text-slate-400">
            Planifié: {formatTime(todayPointage.scheduled_start)}
          </p>
        </div>

        {isCheckedOut ? (
          <div className="rounded-xl bg-white/50 px-3 py-2.5 dark:bg-dark-700/50">
            <p className="text-2xs text-slate-400 mb-0.5">Sortie</p>
            <p className={cn('text-sm font-bold', config.color)}>
              {formatTime(todayPointage.check_out_at)}
            </p>
            <p className="text-2xs text-slate-400">
              Planifié: {formatTime(todayPointage.scheduled_end)}
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-white/50 px-3 py-2.5 dark:bg-dark-700/50">
            <p className="text-2xs text-slate-400 mb-0.5">Fin prévue</p>
            <p className={cn('text-sm font-bold', config.color)}>
              {formatTime(todayPointage.scheduled_end)}
            </p>
            <p className="text-2xs text-emerald-500">En cours ●</p>
          </div>
        )}
      </div>

      {/* Summary row */}
      <div className="mt-3 flex items-center justify-between
                      border-t border-white/30 pt-3 dark:border-dark-600/50">
        {todayPointage.delay_minutes > 0 && (
          <span className="text-xs text-amber-600 dark:text-amber-400">
            ⚠ Retard: {todayPointage.delay_minutes}min
          </span>
        )}
        {isCheckedOut && todayPointage.worked_minutes > 0 && (
          <span className={cn('text-xs font-semibold ml-auto', config.color)}>
            ✓ {formatMinutesToHours(todayPointage.worked_minutes, true)} travaillées
          </span>
        )}
        {todayPointage.is_flagged && (
          <span className="text-xs text-red-500 ml-auto">
            🚩 Pointage signalé — en attente de vérification
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default CurrentStatusCard