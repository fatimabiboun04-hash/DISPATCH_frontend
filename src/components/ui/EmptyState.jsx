import { cn } from '../../utils/cn'
import Button from './Button'

/**
 * EmptyState — shown when a list or table has no data.
 * Every list in the app must have an empty state. Never show a blank screen.
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  className,
  size = 'md',
}) => {
  const sizes = {
    sm: { icon: 'h-10 w-10', iconInner: 'h-5 w-5', title: 'text-sm', desc: 'text-xs' },
    md: { icon: 'h-14 w-14', iconInner: 'h-7 w-7', title: 'text-base', desc: 'text-sm' },
    lg: { icon: 'h-20 w-20', iconInner: 'h-10 w-10', title: 'text-lg', desc: 'text-sm' },
  }
  const s = sizes[size] || sizes.md

  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3 py-12 text-center',
      className
    )}>
      {Icon && (
        <div className={cn(
          'flex flex-shrink-0 items-center justify-center rounded-2xl',
          'bg-surface-100 dark:bg-dark-600',
          s.icon
        )}>
          <Icon className={cn('text-slate-400', s.iconInner)} />
        </div>
      )}
      {title && (
        <p className={cn('font-semibold text-slate-700 dark:text-slate-200', s.title)}>
          {title}
        </p>
      )}
      {description && (
        <p className={cn('max-w-xs text-slate-400 dark:text-slate-500', s.desc)}>
          {description}
        </p>
      )}
      {action && actionLabel && (
        <div className="mt-2">
          <Button onClick={action} size="sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}

export default EmptyState