import { forwardRef, memo } from 'react'
import { cn } from '../../utils/cn'

/**
 * Button — primary interactive element.
 *
 * Variants: primary | secondary | ghost | danger | outline
 * Sizes:    sm | md (default) | lg
 * States:   loading (shows spinner), disabled
 * Icons:    leftIcon / rightIcon props
 */

const VARIANTS = {
  primary:   'bg-brand-500 text-white shadow-sm hover:bg-brand-600 active:bg-brand-700 focus:ring-brand-500 dark:hover:bg-brand-400',
  secondary: 'bg-white border border-surface-200 text-slate-700 shadow-soft hover:bg-surface-50 active:bg-surface-100 focus:ring-brand-500 dark:bg-dark-600 dark:border-dark-400 dark:text-slate-200 dark:hover:bg-dark-500',
  ghost:     'text-slate-600 hover:bg-surface-100 active:bg-surface-200 focus:ring-brand-500 dark:text-slate-400 dark:hover:bg-dark-600',
  danger:    'bg-red-500 text-white shadow-sm hover:bg-red-600 active:bg-red-700 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-500',
  outline:   'border border-brand-500 text-brand-600 hover:bg-brand-50 active:bg-brand-100 focus:ring-brand-500 dark:border-brand-400 dark:text-brand-400 dark:hover:bg-brand-900/20',
}

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-sm gap-2 rounded-xl',
}

const Button = forwardRef(({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  type = 'button',
  ...props
}, ref) => (
  <button
    ref={ref}
    type={type}
    disabled={disabled || loading}
    className={cn(
      'inline-flex items-center justify-center font-medium',
      'transition-all duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      VARIANTS[variant] || VARIANTS.primary,
      SIZES[size]       || SIZES.md,
      fullWidth && 'w-full',
      className
    )}
    {...props}
  >
    {loading ? (
      <span className="h-4 w-4 animate-spin rounded-full
                       border-2 border-current border-t-transparent" />
    ) : leftIcon}
    {children}
    {!loading && rightIcon}
  </button>
))

Button.displayName = 'Button'
export default memo(Button)