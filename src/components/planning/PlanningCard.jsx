import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle, Lock, Clock, ChevronRight,
  Zap, Trash2,
} from 'lucide-react'
import ShiftBadge    from './ShiftBadge'
import UserAvatarRow from './UserAvatarRow'
import { Badge, Tooltip, Button } from '../ui'
import { getShiftColor } from '../../constants/shiftColors'
import { cn }            from '../../utils/cn'

/**
 * PlanningCard — collapsed planning cell card.
 *
 * Backend shape (from GET /v1/planning):
 * planning: {
 *   id, date, is_locked, notes,
 *   user:    { id, name, avatar_url },
 *   shift:   { id, name, type, start_time, end_time, color },
 *   team:    { id, name, color } | null,
 *   creator: { id, name }
 * }
 *
 * ALWAYS VISIBLE in collapsed state:
 * - Shift badge (type + time)
 * - Team name
 * - User avatar + short name + status dot
 * - Conflict icon (when hasConflict)
 * - Overtime warning
 * - Lock icon (when is_locked)
 *
 * onClick → opens PlanningDrawer (Phase 9)
 */
const PlanningCard = ({
  planning,
  onClick,
  onDelete,
  hasConflict  = false,
  isOvertimeWarning = false,
  animate      = true,
  index        = 0,
  className,
}) => {
  const [shakeActive, setShakeActive] = useState(false)
  const shiftColor = getShiftColor(planning.shift?.type)
  const isLocked   = planning.is_locked

  const handleClick = () => {
    if (hasConflict) {
      // Trigger shake animation
      setShakeActive(true)
      setTimeout(() => setShakeActive(false), 500)
    }
    onClick?.(planning)
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
        // Conflict: red border
        hasConflict
          ? 'border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-900/10'
          : [
              shiftColor.border,
              'bg-white dark:bg-dark-700',
            ],
        // Locked: slightly muted
        isLocked && 'opacity-80',
        // Shake animation on conflict click
        shakeActive && 'animate-shake',
        className
      )}
    >
      {/* Top: shift badge + icons */}
      <div className="flex items-start justify-between gap-1.5">
        <ShiftBadge shift={planning.shift} compact />

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Conflict indicator */}
          {hasConflict && (
            <Tooltip content="Conflit de planning détecté">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
            </Tooltip>
          )}
          {/* Overtime warning */}
          {isOvertimeWarning && !hasConflict && (
            <Tooltip content="Alerte : Heures Supplémentaires">
              <Zap className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
            </Tooltip>
          )}
          {/* Lock indicator */}
          {isLocked && (
            <Tooltip content="Planning verrouillé">
              <Lock className="h-3 w-3 text-slate-400 flex-shrink-0" />
            </Tooltip>
          )}
        </div>
      </div>

      {/* Middle: team + user */}
      <div className="flex flex-col gap-1.5 min-w-0">
        {/* Team badge */}
        {planning.team && (
          <div className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: planning.team.color || '#6172f3' }}
            />
            <span className="truncate text-2xs font-medium text-slate-500 dark:text-slate-400">
              {planning.team.name}
            </span>
          </div>
        )}

        {/* User info */}
        <UserAvatarRow
          users={[{
            id:              planning.user?.id,
            name:            planning.user?.name || '—',
            avatar_url:      planning.user?.avatar_url,
            // pointage_status comes from live data — not in planning record
            pointage_status: planning.user?.pointage_status || 'pending',
          }]}
          max={1}
          size="xs"
        />
      </div>

      {/* Bottom: time + actions */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1 text-2xs text-slate-400">
          <Clock className="h-3 w-3" />
          <span>{planning.shift?.start_time} – {planning.shift?.end_time}</span>
        </div>

        {/* Delete button — only when not locked */}
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

        {/* Expand chevron */}
        <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-600
                                  group-hover:text-slate-500 transition-colors" />
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