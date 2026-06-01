import { getShiftColor } from '../../constants/shiftColors'
import { cn } from '../../utils/cn'

/**
 * ShiftBadge — compact type+time badge used inside PlanningCard.
 *
 * shift: { name, type, start_time, end_time, color? }
 * Shows type color + name + time range.
 */
const ShiftBadge = ({ shift, compact = false, className }) => {
  if (!shift) return null
  const config       = getShiftColor(shift.type)
  const displayColor = shift.color || config.hex

  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 rounded-lg border px-2 py-1',
      config.bg, config.border,
      className
    )}>
      {/* Color dot using custom or type color */}
      <span
        className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
        style={{ backgroundColor: displayColor }}
      />
      <span className={cn('text-2xs font-semibold truncate', config.text)}>
        {compact ? shift.start_time : shift.name}
      </span>
      {!compact && (
        <span className={cn('text-2xs opacity-60', config.text)}>
          {shift.start_time}–{shift.end_time}
        </span>
      )}
    </div>
  )
}

export default ShiftBadge