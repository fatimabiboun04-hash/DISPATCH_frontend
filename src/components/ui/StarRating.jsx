import { useState, useCallback } from 'react'
import { Star } from 'lucide-react'
import { cn } from '../../utils/cn'

const StarRating = ({
  value = 0,
  onChange,
  readonly = false,
  size = 'md',
  showLabel = false,
  className,
}) => {
  const [hovered, setHovered] = useState(0)

  const sizes = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-7 w-7' }
  const starSize = sizes[size] || sizes.md

  const handleClick = useCallback((score) => {
    if (!readonly && onChange) {
      onChange(score === value ? 0 : score)
    }
  }, [readonly, onChange, value])

  const handleKeyDown = useCallback((e, score) => {
    if ((e.key === 'Enter' || e.key === ' ') && !readonly) {
      e.preventDefault()
      handleClick(score)
    }
  }, [handleClick, readonly])

  const labelMap = {
    0: 'Non noté',
    1: 'À améliorer',
    2: 'Moyen',
    3: 'Bien',
    4: 'Très bien',
    5: 'Excellent',
  }

  const display = hovered || value

  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((score) => {
        const filled = score <= display
        const half = !filled && score - 0.5 <= display

        return (
          <button
            key={score}
            type="button"
            disabled={readonly}
            tabIndex={readonly ? -1 : 0}
            role="radio"
            aria-checked={value === score}
            aria-label={`${score} étoile${score > 1 ? 's' : ''}`}
            onClick={() => handleClick(score)}
            onKeyDown={(e) => handleKeyDown(e, score)}
            onMouseEnter={() => !readonly && setHovered(score)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={cn(
              'transition-all duration-100',
              readonly ? 'cursor-default' : 'cursor-pointer',
              hovered >= score && !readonly && 'scale-110'
            )}
          >
            <Star
              className={cn(
                starSize,
                'transition-colors duration-100',
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : half
                    ? 'fill-amber-400/50 text-amber-400/50'
                    : 'fill-surface-200 text-surface-300 dark:fill-dark-500 dark:text-dark-500'
              )}
            />
          </button>
        )
      })}
      {showLabel && (
        <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500 min-w-[5rem]">
          {labelMap[display] || labelMap[0]}
        </span>
      )}
    </div>
  )
}

export default StarRating
