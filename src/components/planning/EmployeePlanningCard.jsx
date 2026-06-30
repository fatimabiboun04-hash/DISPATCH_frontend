import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Lock, Coffee, ListChecks, FileText } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Tooltip } from '../ui'
import { getShiftColor } from '../../constants/shiftColors'

const determineState = (startTime, endTime, date) => {
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  // If the planning date is in the past, it's ENDED
  if (date < today) return 'ENDED'
  // If the planning date is in the future, it's UPCOMING
  if (date > today) return 'UPCOMING'

  // Today: check time
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const [sh, sm] = (startTime || '00:00').split(':').map(Number)
  const [eh, em] = (endTime || '23:59').split(':').map(Number)
  const startMin = sh * 60 + sm
  const endMin = eh * 60 + em

  if (nowMin >= startMin && nowMin < endMin) return 'ACTIVE'
  if (nowMin >= endMin) return 'ENDED'
  return 'UPCOMING'
}

const STATE_CONFIG = {
  UPCOMING: {
    dot: 'bg-slate-300 dark:bg-dark-400',
    border: 'border-surface-200 dark:border-dark-600',
    bg: 'bg-white dark:bg-dark-700',
    text: 'text-slate-600 dark:text-slate-300',
    muted: 'text-slate-400 dark:text-slate-500',
    badge: 'bg-slate-100 text-slate-500 dark:bg-dark-600 dark:text-slate-400',
  },
  ACTIVE: {
    dot: 'bg-emerald-500 animate-pulse',
    border: 'border-emerald-300 dark:border-emerald-700',
    bg: 'bg-emerald-50 dark:bg-emerald-900/15',
    text: 'text-emerald-700 dark:text-emerald-300',
    muted: 'text-emerald-600/70 dark:text-emerald-400/70',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  ENDED: {
    dot: 'bg-slate-200 dark:bg-dark-500',
    border: 'border-surface-100 dark:border-dark-600',
    bg: 'bg-surface-50 opacity-60 dark:bg-dark-800',
    text: 'text-slate-400',
    muted: 'text-slate-300 dark:text-dark-500',
    badge: 'bg-slate-100 text-slate-400 dark:bg-dark-600',
  },
}

const STATE_LABELS = {
  UPCOMING: 'À venir',
  ACTIVE: 'En cours',
  ENDED: 'Terminé',
}

const formatDuration = (hours) => {
  if (!hours && hours !== 0) return null
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${m}`
}

const EmployeePlanningCard = ({ planning, index = 0 }) => {
  const shift = planning.shift

  const durationFormatted = useMemo(
    () => formatDuration(planning.duration_hours),
    [planning.duration_hours]
  )

  if (!shift) return null

  const state = determineState(shift.start_time, shift.end_time, planning.date)
  const cfg = STATE_CONFIG[state] || STATE_CONFIG.UPCOMING
  const shiftColor = getShiftColor(shift.type)

  const taskCount = planning.tasks_count ?? planning.tasks?.length ?? 0
  const hasNotes = !!planning.notes
  const isLocked = !!planning.is_locked || !!planning.week_locked
  const teamColor = planning.team?.color

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className={cn(
        'rounded-xl border-l-4 px-4 py-3',
        cfg.border,
        cfg.bg,
      )}
      style={teamColor ? { borderLeftColor: teamColor } : undefined}
    >
      {/* Top row: time + status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', cfg.dot)} />
          <span className={cn('text-xs font-mono font-medium', cfg.text)}>
            {shift.start_time} – {shift.end_time}
          </span>
          {durationFormatted && (
            <span className={cn('text-2xs', cfg.muted)}>
              ({durationFormatted})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {isLocked && (
            <Tooltip content="Verrouillé">
              <Lock className="h-3 w-3 text-slate-400" />
            </Tooltip>
          )}
          <span className={cn('rounded-full px-2 py-0.5 text-2xs font-semibold', cfg.badge)}>
            {STATE_LABELS[state]}
          </span>
        </div>
      </div>

      {/* Shift name + team */}
      <div className="mt-1.5 flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: shiftColor?.bg || shiftColor?.color || '#6172f3' }}
        />
        <p className={cn('text-sm font-medium', cfg.text)}>
          {shift.name}
        </p>
        {planning.team && (
          <span className={cn('text-2xs', cfg.muted)}>
            · {planning.team.name}
          </span>
        )}
      </div>

      {/* Icons row: tasks, notes, pause info */}
      <div className="mt-2 flex items-center gap-3">
        {taskCount > 0 && (
          <Tooltip content={`${taskCount} tâche(s)`}>
            <span className="flex items-center gap-1 text-2xs text-slate-400">
              <ListChecks className="h-3 w-3" />
              {taskCount}
            </span>
          </Tooltip>
        )}

        {hasNotes && (
          <Tooltip content={planning.notes}>
            <FileText className="h-3 w-3 text-slate-400" />
          </Tooltip>
        )}

        {planning.break_minutes > 0 && (
          <span className="flex items-center gap-1 text-2xs text-slate-400">
            <Coffee className="h-3 w-3" />
            {planning.break_minutes}min
          </span>
        )}

        {planning.is_locked && (
          <span className="flex items-center gap-1 text-2xs text-slate-400">
            <Lock className="h-3 w-3" />
            Verrouillé
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default EmployeePlanningCard
