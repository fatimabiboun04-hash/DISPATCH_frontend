import { cn } from '../../utils/cn'
import { getShiftColor } from '../../constants/shiftColors'

/**
 * ShiftTypeBadge — colored label for shift type.
 *
 * Maps shift.type (backend enum) to color system from shiftColors constants.
 * type: 'day' | 'night' | 'conge' | 'absence' | 'emergency'
 */
const ShiftTypeBadge = ({ type, size = 'md', className }) => {
  const config = getShiftColor(type)

  const sizes = {
    sm: 'px-2 py-0.5 text-2xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-lg font-semibold',
      'border',
      config.bg,
      config.text,
      config.border,
      sizes[size] || sizes.md,
      className
    )}>
      {/* Color dot */}
      <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', config.dot)} />
      {config.label}
    </span>
  )
}

export default ShiftTypeBadge