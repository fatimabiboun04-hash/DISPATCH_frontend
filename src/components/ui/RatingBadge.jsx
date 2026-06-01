import { cn } from '../../utils/cn'

/**
 * RatingBadge — shows ⭐ Excellent or 🚩 Warning.
 *
 * Maps to Rating.type from backend: 'excellent' | 'warning'
 * First click → 'excellent', second click on same → 'warning'
 */
const RatingBadge = ({ type, showLabel = true, size = 'md', className }) => {
  if (!type) return null

  const isExcellent = type === 'excellent'

  const sizes = {
    sm: 'px-1.5 py-0.5 text-2xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  }

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      isExcellent
        ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
        : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      sizes[size] || sizes.md,
      className
    )}>
      {isExcellent ? '⭐' : '🚩'}
      {showLabel && (
        <span>{isExcellent ? 'Excellent' : 'Attention'}</span>
      )}
    </span>
  )
}

export default RatingBadge