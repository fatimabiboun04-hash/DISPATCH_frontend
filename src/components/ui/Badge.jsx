import { cn } from '../../utils/cn'

/**
 * Badge — colored pill for statuses, labels, categories.
 *
 * Variants: default | primary | success | warning | danger | info | purple
 * Sizes:    sm | md (default)
 * Dot:      optional leading colored dot
 */

const VARIANTS = {
  default: 'bg-slate-100 text-slate-700 dark:bg-dark-500 dark:text-slate-300',
  primary: 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  danger:  'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  info:    'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  purple:  'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
}

const DOT_COLORS = {
  default: 'bg-slate-400',
  primary: 'bg-brand-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger:  'bg-red-500',
  info:    'bg-blue-500',
  purple:  'bg-violet-500',
}

const SIZES = {
  sm: 'px-2 py-0.5 text-2xs',
  md: 'px-2.5 py-0.5 text-xs',
}

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
}) => (
  <span className={cn(
    'inline-flex items-center gap-1.5 rounded-full font-medium',
    VARIANTS[variant] || VARIANTS.default,
    SIZES[size]   || SIZES.md,
    className
  )}>
    {dot && (
      <span className={cn(
        'h-1.5 w-1.5 flex-shrink-0 rounded-full',
        DOT_COLORS[variant] || DOT_COLORS.default
      )} />
    )}
    {children}
  </span>
)

export default Badge