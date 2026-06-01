import { Edit2, Trash2 } from 'lucide-react'
import { Button, Tooltip } from '../ui'
import { getAvatarData }   from '../../utils/avatarGenerator'
import { cn }              from '../../utils/cn'

/**
 * PauseRow — single pause in the pause layer.
 *
 * Pause data shape (from getByPlanning):
 *   { id, user_id, team_id, planning_id,
 *     pause_start: 'HH:mm', pause_end: 'HH:mm',
 *     duration_minutes, is_active,
 *     user: { id, name, avatar_url }?,
 *     team: { id, name }? }
 *
 * Display only — pause does NOT count toward 44h.
 * Per spec: "Similar to planning but simpler. Display only."
 */
const PauseRow = ({ pause, onEdit, onDelete }) => {
  const { gradient, initials } = getAvatarData(pause.user?.name || '')
  const name    = pause.user?.name || pause.team?.name || '—'
  const isTeam  = !!pause.team_id && !pause.user_id
  const isActive = pause.is_active

  return (
    <div className={cn(
      'group flex items-center gap-3 rounded-lg px-3 py-2',
      'border border-surface-100 bg-surface-50',
      'dark:border-dark-600 dark:bg-dark-700',
      'transition-colors hover:bg-white dark:hover:bg-dark-600'
    )}>
      {/* Avatar or team icon */}
      {!isTeam ? (
        <div
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center
                     rounded-full text-2xs font-bold text-white"
          style={{ background: gradient }}
        >
          {initials.slice(0, 1)}
        </div>
      ) : (
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center
                        rounded-full bg-brand-100 text-2xs font-bold text-brand-600
                        dark:bg-brand-900/30 dark:text-brand-400">
          T
        </div>
      )}

      {/* Name */}
      <span className="flex-1 truncate text-xs font-medium
                       text-slate-700 dark:text-slate-200">
        {name}
        {isTeam && (
          <span className="ml-1 text-2xs text-slate-400">(équipe)</span>
        )}
      </span>

      {/* Time window */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {isActive && (
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        )}
        <span className="text-2xs font-medium text-slate-500 dark:text-slate-400">
          {pause.pause_start} – {pause.pause_end}
        </span>
        {pause.duration_minutes > 0 && (
          <span className="text-2xs text-slate-400">
            ({pause.duration_minutes}min)
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1
                      opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip content="Modifier">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onEdit?.(pause)}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        </Tooltip>
        <Tooltip content="Supprimer">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-400 hover:bg-red-50
                       hover:text-red-600 dark:hover:bg-red-900/20"
            onClick={() => onDelete?.(pause)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}

export default PauseRow