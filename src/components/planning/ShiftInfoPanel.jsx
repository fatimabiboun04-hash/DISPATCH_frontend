import { memo } from 'react'
import { Clock, Award } from 'lucide-react'
import { Badge, SkillBadge } from '../ui'
import { getShiftColor } from '../../constants/shiftColors'
import { cn } from '../../utils/cn'

const ShiftInfoPanel = ({ shift, compact = false }) => {
  if (!shift) return null

  const shiftColor = getShiftColor(shift.type)
  const duration = shift.duration_hours
  const hasSkills = shift.skills?.length > 0
  const isActive = shift.is_active !== false

  if (compact) {
    return (
      <div className={cn(
        'rounded-lg border px-2.5 py-2',
        shiftColor.bg, shiftColor.border
      )}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: shift.color || shiftColor?.hex }} />
            <span className={cn('text-xs font-semibold truncate', shiftColor.text)}>
              {shift.name}
            </span>
          </div>
          <span className="text-2xs text-slate-400 flex-shrink-0">
            {duration > 0 ? `${duration}h` : '—'}
          </span>
        </div>
        {hasSkills && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {shift.skills.slice(0, 2).map((skill) => (
              <SkillBadge key={skill.id} name={skill.name} className="text-2xs px-1.5 py-0" />
            ))}
            {shift.skills.length > 2 && (
              <span className="text-2xs text-slate-400">+{shift.skills.length - 2}</span>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      'rounded-xl border p-3 space-y-2.5',
      shiftColor.bg, shiftColor.border
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: shift.color || shiftColor?.hex }}
          />
          <span className={cn('text-sm font-bold', shiftColor.text)}>
            {shift.name}
          </span>
        </div>
        {!isActive && (
          <Badge variant="warning" size="sm">Inactif</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-2xs text-slate-500">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{shift.start_time} → {shift.end_time}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>Type: {shift.type}</span>
        </div>
      </div>

      {duration > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {duration}h
          </span>
          <span className="text-slate-400">durée</span>
        </div>
      )}

      {hasSkills && (
        <div className="border-t border-current/10 pt-2">
          <div className="flex items-center gap-1 mb-1.5">
            <Award className="h-3 w-3 text-slate-400" />
            <span className="text-2xs font-medium text-slate-400">Compétences requises</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {shift.skills.map((skill) => (
              <SkillBadge key={skill.id} name={skill.name} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(ShiftInfoPanel)
