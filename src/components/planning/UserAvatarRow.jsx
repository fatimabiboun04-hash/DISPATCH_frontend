import { Avatar, StatusDot, Tooltip } from '../ui'
import { cn } from '../../utils/cn'

/**
 * UserAvatarRow — compact row of user avatars + names + status dots.
 * Used inside PlanningCard collapsed state.
 *
 * users: [{ id, name, avatar_url, pointage_status? }]
 * pointage_status: 'present' | 'late' | 'absent' | 'on_leave' | 'pending'
 *
 * Shows first `max` users then "+N more" indicator.
 */
const UserAvatarRow = ({
  users   = [],
  max     = 4,
  size    = 'xs',
  showNames = true,
  className,
}) => {
  if (users.length === 0) {
    return (
      <p className="text-2xs text-slate-400 italic">Aucun employé assigné</p>
    )
  }

  const visible  = users.slice(0, max)
  const overflow = users.length - max

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {visible.map((user) => (
        <div key={user.id} className="flex items-center gap-2">
          {/* Avatar + status dot */}
          <div className="relative flex-shrink-0">
            <Avatar
              src={user.avatar_url}
              name={user.name}
              size={size}
            />
            {user.pointage_status && (
              <StatusDot
                status={user.pointage_status}
                size="xs"
                className="absolute -bottom-0.5 -right-0.5 ring-1 ring-white dark:ring-dark-700"
              />
            )}
          </div>
          {/* Short name */}
          {showNames && (
            <span className="truncate text-2xs font-medium text-slate-600 dark:text-slate-300">
              {user.name.split(' ')[0]}
            </span>
          )}
        </div>
      ))}
      {overflow > 0 && (
        <p className="text-2xs text-slate-400">
          +{overflow} autre{overflow > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}

export default UserAvatarRow