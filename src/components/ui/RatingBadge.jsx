import { memo } from 'react'
import StarRating from './StarRating'
import { cn } from '../../utils/cn'

const scoreConfig = {
  5: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', label: 'Excellent' },
  4: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', label: 'Très bien' },
  3: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'Bien' },
  2: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', label: 'Moyen' },
  1: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: 'À améliorer' },
}

const RatingBadge = ({ score, type, showLabel = true, size = 'md', className }) => {
  if (score) {
    const config = scoreConfig[score]
    if (!config) return null
    const sizes = { sm: 'px-1.5 py-0.5 gap-1', md: 'px-2.5 py-1 gap-1.5' }
    return (
      <span className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.bg, config.text,
        sizes[size] || sizes.md,
        className
      )}>
        <StarRating value={score} readonly size="sm" />
        {showLabel && <span className="text-2xs ml-0.5">{config.label}</span>}
      </span>
    )
  }

  // Fallback for legacy type-based ratings
  if (type === 'excellent' || type === 'warning') {
    const sizes = { sm: 'px-1.5 py-0.5 text-2xs gap-1', md: 'px-2.5 py-1 text-xs gap-1.5' }
    const isExcellent = type === 'excellent'
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
        {showLabel && <span>{isExcellent ? 'Excellent' : 'Attention'}</span>}
      </span>
    )
  }

  return null
}

export default memo(RatingBadge)