import { memo } from 'react'
import { cn } from '../../utils/cn'
import { motion } from 'framer-motion'

/**
 * Switch — animated toggle switch.
 * Used for: shift active toggle, settings toggles.
 */
const Switch = ({
  checked   = false,
  onChange,
  label,
  disabled  = false,
  size      = 'md',
  className,
}) => {
  const sizes = {
    sm: { track: 'w-8 h-4',   thumb: 'h-3 w-3',   translate: 'translateX(16px)' },
    md: { track: 'w-10 h-5.5',thumb: 'h-4 w-4',   translate: 'translateX(20px)' },
    lg: { track: 'w-12 h-6',  thumb: 'h-5 w-5',   translate: 'translateX(24px)' },
  }
  const s = sizes[size] || sizes.md

  return (
    <label className={cn(
      'flex items-center gap-2.5 cursor-pointer select-none',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    )}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={cn(
          'relative inline-flex flex-shrink-0 rounded-full',
          'transition-colors duration-200 focus:outline-none',
          'focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
          s.track,
          checked
            ? 'bg-brand-500'
            : 'bg-slate-200 dark:bg-dark-400'
        )}
      >
        <motion.span
          animate={{ x: checked ? parseInt(s.translate) : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={cn(
            'absolute top-0.5 left-0 inline-block rounded-full',
            'bg-white shadow-sm',
            s.thumb
          )}
        />
      </button>
      {label && (
        <span className="text-sm text-slate-700 dark:text-slate-200">
          {label}
        </span>
      )}
    </label>
  )
}

export default memo(Switch)