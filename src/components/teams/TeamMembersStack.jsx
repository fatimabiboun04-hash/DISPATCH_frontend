import { Avatar, Tooltip } from '../ui'
import { cn } from '../../utils/cn'

/**
 * TeamMembersStack — overlapping avatar circles.
 *
 * Displays up to `max` avatars with a "+N" overflow badge.
 * Each avatar uses user.avatar_url (or initials fallback).
 *
 * Backend: user.avatar_url accessor (fix #4)
 * users: [{ id, name, avatar_url?, pivot: { joined_at } }]
 */
const TeamMembersStack = ({
  users = [],
  max   = 5,
  size  = 'sm',   // Avatar size
  className,
}) => {
  const visible  = users.slice(0, max)
  const overflow = users.length - max

  if (users.length === 0) {
    return (
      <span className="text-xs text-slate-400 italic">
        Aucun membre
      </span>
    )
  }

  return (
    <div className={cn('flex items-center', className)}>
      {/* Overlapping avatars */}
      <div className="flex -space-x-2">
        {visible.map((user, i) => (
          <Tooltip key={user.id} content={user.name}>
            <div style={{ zIndex: visible.length - i }}>
              <Avatar
                src={user.avatar_url}
                name={user.name}
                size={size}
                ring
                ringColor="ring-white dark:ring-dark-700"
                className="transition-transform duration-150 hover:scale-110 hover:z-10"
              />
            </div>
          </Tooltip>
        ))}
      </div>

      {/* Overflow count */}
      {overflow > 0 && (
        <div className={cn(
          'flex flex-shrink-0 items-center justify-center',
          'rounded-full bg-surface-200 dark:bg-dark-500',
          'ring-2 ring-white dark:ring-dark-700',
          '-ml-2 z-10',
          size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
        )}>
          <span className="font-semibold text-slate-600 dark:text-slate-300">
            +{overflow}
          </span>
        </div>
      )}
    </div>
  )
}

export default TeamMembersStack