import { cn } from '../../utils/cn'

/**
 * Card — base surface container.
 * Variants: default | flat | elevated | ghost
 */

const VARIANTS = {
  default:  'bg-white border border-surface-200 shadow-card dark:bg-dark-700 dark:border-dark-600',
  flat:     'bg-white border border-surface-200 dark:bg-dark-700 dark:border-dark-600',
  elevated: 'bg-white border border-surface-200 shadow-strong dark:bg-dark-700 dark:border-dark-600',
  ghost:    'bg-surface-50 dark:bg-dark-800',
}

const Card = ({
  children,
  variant   = 'default',
  className,
  padding   = 'p-5',
  hover     = false,
  onClick,
  ...props
}) => (
  <div
    onClick={onClick}
    className={cn(
      'rounded-xl',
      VARIANTS[variant] || VARIANTS.default,
      padding,
      hover && 'transition-shadow duration-200 hover:shadow-card-hover cursor-pointer',
      onClick && 'cursor-pointer',
      className
    )}
    {...props}
  >
    {children}
  </div>
)

// Sub-components for semantic structure
Card.Header = ({ children, className }) => (
  <div className={cn('mb-4 flex items-center justify-between', className)}>
    {children}
  </div>
)

Card.Title = ({ children, className }) => (
  <h3 className={cn('text-sm font-semibold text-slate-800 dark:text-slate-100', className)}>
    {children}
  </h3>
)

Card.Body = ({ children, className }) => (
  <div className={cn(className)}>{children}</div>
)

export default Card