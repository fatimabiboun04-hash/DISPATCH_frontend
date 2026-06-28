import { memo } from 'react'
import { cn } from '../../utils/cn'
import { getAvatarColor } from '../../utils/avatarGenerator'

/**
 * SkillBadge — colored pill for employee skills.
 *
 * Backend source: skill_user pivot fields:
 *   skill.name, skill.category, pivot.level, pivot.certified_at
 *
 * Level: 1=Débutant | 2=Intermédiaire | 3=Expert
 */

const LEVEL_LABELS = {
  1: 'Débutant',
  2: 'Intermédiaire',
  3: 'Expert',
}

const SkillBadge = ({ name, level, category, showLevel = false, className }) => {
  // Generate a consistent color from the skill name
  const color = getAvatarColor(name)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5',
        'text-xs font-medium border',
        className
      )}
      style={{
        backgroundColor: `${color}15`,  // 15 = ~8% opacity
        borderColor:     `${color}30`,  // 30 = ~19% opacity
        color:            color,
      }}
    >
      {name}
      {showLevel && level && (
        <span className="opacity-60">
          · {LEVEL_LABELS[level] || level}
        </span>
      )}
    </span>
  )
}

export default memo(SkillBadge)