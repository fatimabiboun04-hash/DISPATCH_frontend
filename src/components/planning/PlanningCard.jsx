import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
  AlertTriangle, Lock, Clock, ChevronRight,
  Zap, Trash2, Copy, Coffee,
} from 'lucide-react'
import ShiftBadge    from './ShiftBadge'
import UserAvatarRow from './UserAvatarRow'
import { Badge, Tooltip, SkillBadge } from '../ui'
import { getShiftColor } from '../../constants/shiftColors'
import { cn }            from '../../utils/cn'
import { createPlanningThunk, lockPlanningThunk } from '../../features/planning/planningThunks'
import toast from 'react-hot-toast'

const PlanningCard = ({
  planning,
  pauses = [],
  onClick,
  onDelete,
  onRefresh,
  hasConflict  = false,
  isOvertimeWarning = false,
  animate      = true,
  index        = 0,
  className,
}) => {
  const activePause = pauses.find((p) => p.status === 'active' || p.is_active)
  const scheduledPause = pauses.find((p) => p.status === 'scheduled')
  const dispatch = useDispatch()
  const [shakeActive, setShakeActive] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const shiftColor = getShiftColor(planning.shift?.type)
  const isLocked   = planning.is_locked
  const teamColor  = planning.team?.color || '#6172f3'
  const hasSkills  = planning.shift?.skills?.length > 0
  const durationH  = planning.shift?.duration_hours

  const handleClick = () => {
    if (hasConflict) {
      setShakeActive(true)
      setTimeout(() => setShakeActive(false), 500)
    }
    onClick?.(planning)
  }

  const handleDuplicate = async (e) => {
    e.stopPropagation()
    if (isLocked || actionLoading) return
    setActionLoading('duplicate')
    const nextDate = new Date(planning.date)
    nextDate.setDate(nextDate.getDate() + 1)
    const targetDate = nextDate.toISOString().split('T')[0]
    const result = await dispatch(createPlanningThunk({
      user_id: planning.user_id,
      shift_id: planning.shift_id,
      date: targetDate,
      team_id: planning.team_id || undefined,
      notes: planning.notes || undefined,
    }))
    setActionLoading(null)
    if (createPlanningThunk.fulfilled.match(result)) {
      toast.success('Assignation dupliquée au lendemain')
      onRefresh?.()
    }
  }

  const handleCopyPrev = async (e) => {
    e.stopPropagation()
    if (isLocked || actionLoading) return
    setActionLoading('copy')
    const prevDate = new Date(planning.date)
    prevDate.setDate(prevDate.getDate() - 1)
    const prevDateStr = prevDate.toISOString().split('T')[0]
    const result = await dispatch(createPlanningThunk({
      user_id: planning.user_id,
      shift_id: planning.shift_id,
      date: prevDateStr,
      team_id: planning.team_id || undefined,
    }))
    setActionLoading(null)
    if (createPlanningThunk.fulfilled.match(result)) {
      toast.success('Copié au jour précédent')
      onRefresh?.()
    }
  }

  const handleToggleLock = async (e) => {
    e.stopPropagation()
    if (actionLoading) return
    setActionLoading('lock')
    const result = await dispatch(lockPlanningThunk(planning.id))
    setActionLoading(null)
    if (lockPlanningThunk.fulfilled.match(result)) {
      toast.success(isLocked ? 'Assignation déverrouillée' : 'Assignation verrouillée')
      onRefresh?.()
    }
  }

  return (
    <motion.div
      initial={animate ? { opacity: 0, scale: 0.97 } : false}
      animate={animate ? { opacity: 1, scale: 1 } : false}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={handleClick}
      className={cn(
        'group relative flex flex-col gap-2 rounded-xl border p-3',
        'cursor-pointer transition-all duration-150',
        'hover:shadow-medium hover:-translate-y-0.5',
        hasConflict
          ? 'border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-900/10'
          : [
              shiftColor.border,
              'bg-white dark:bg-dark-700',
            ],
        isLocked && 'opacity-80',
        shakeActive && 'animate-shake',
        className
      )}
      style={!hasConflict && planning.team ? { borderLeftColor: teamColor } : undefined}
    >
      {/* Team color accent bar */}
      {!hasConflict && planning.team && (
        <span
          className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
          style={{ backgroundColor: teamColor }}
        />
      )}

      {/* Quick actions overlay on hover */}
      {!isLocked && (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-0.5
                        opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip content="Copier au jour précédent">
            <button
              onClick={handleCopyPrev}
              className="flex h-5 w-5 items-center justify-center rounded
                         bg-white/80 text-slate-400 shadow-xs
                         hover:bg-brand-50 hover:text-brand-500
                         dark:bg-dark-600/80 dark:hover:bg-brand-900/20"
            >
              {actionLoading === 'copy' ? (
                <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Copy className="h-2.5 w-2.5" />
              )}
            </button>
          </Tooltip>
          <Tooltip content="Dupliquer au lendemain">
            <button
              onClick={handleDuplicate}
              className="flex h-5 w-5 items-center justify-center rounded
                         bg-white/80 text-slate-400 shadow-xs
                         hover:bg-brand-50 hover:text-brand-500
                         dark:bg-dark-600/80 dark:hover:bg-brand-900/20"
            >
              {actionLoading === 'duplicate' ? (
                <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Copy className="h-2.5 w-2.5 rotate-180" />
              )}
            </button>
          </Tooltip>
        </div>
      )}

      {/* Top: shift badge + icons */}
      <div className="flex items-start justify-between gap-1.5 pl-1">
        <div className="flex flex-col gap-1 min-w-0">
          <ShiftBadge shift={planning.shift} compact />
          {hasSkills && (
            <div className="flex flex-wrap gap-1">
              {planning.shift.skills.slice(0, 2).map((skill) => (
                <SkillBadge key={skill.id} name={skill.name} />
              ))}
              {planning.shift.skills.length > 2 && (
                <span className="text-2xs text-slate-400">
                  +{planning.shift.skills.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {hasConflict && (
            <Tooltip content="Conflit de planning détecté">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
            </Tooltip>
          )}
          {isOvertimeWarning && !hasConflict && (
            <Tooltip content="Alerte : Heures Supplémentaires">
              <Zap className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
            </Tooltip>
          )}
          {isLocked && (
            <Tooltip content="Planning verrouillé">
              <Lock className="h-3 w-3 text-slate-400 flex-shrink-0" />
            </Tooltip>
          )}
          {activePause && (
            <Tooltip content={`Pause en cours (${activePause.type || 'pause'})`}>
              <Coffee className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
            </Tooltip>
          )}
          {!activePause && scheduledPause && (
            <Tooltip content={`Pause planifiée (${scheduledPause.pause_start})`}>
              <Coffee className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            </Tooltip>
          )}
        </div>
      </div>

      {/* Middle: user info */}
      <div className="flex flex-col gap-1.5 min-w-0 pl-1">
        <UserAvatarRow
          users={[{
            id:         planning.user?.id,
            name:       planning.user?.name || '—',
            avatar_url: planning.user?.avatar_url,
          }]}
          max={1}
          size="xs"
        />
      </div>

      {/* Bottom: time + hours + actions */}
      <div className="flex items-center justify-between mt-auto pl-1">
        <div className="flex items-center gap-2 text-2xs text-slate-400">
          <Clock className="h-3 w-3" />
          <span>{planning.shift?.start_time} – {planning.shift?.end_time}</span>
          {durationH > 0 && (
            <span className="text-slate-300 dark:text-slate-500">
              · {durationH}h
            </span>
          )}
          {planning.team && (
            <span className="hidden sm:inline text-slate-300 dark:text-slate-500">
              · {planning.team.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!isLocked && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(planning)
              }}
              className="flex h-5 w-5 items-center justify-center rounded
                         opacity-0 group-hover:opacity-100 transition-opacity
                         text-red-400 hover:bg-red-50 hover:text-red-600
                         dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
          <button
            onClick={handleToggleLock}
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded transition-opacity',
              'opacity-0 group-hover:opacity-100',
              isLocked
                ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-dark-500'
            )}
          >
            {actionLoading === 'lock' ? (
              <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Lock className={cn('h-3 w-3', isLocked && 'fill-amber-200 dark:fill-amber-800')} />
            )}
          </button>
          <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-600
                                    group-hover:text-slate-500 transition-colors" />
        </div>
      </div>

      {/* Notes indicator */}
      {planning.notes && (
        <div className="rounded-md bg-surface-100 px-2 py-0.5
                        dark:bg-dark-600">
          <p className="truncate text-2xs text-slate-400">{planning.notes}</p>
        </div>
      )}
    </motion.div>
  )
}

export default PlanningCard
