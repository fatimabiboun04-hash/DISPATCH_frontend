import { cn } from '../../utils/cn'

/**
 * SettingsSection — grouped settings block with title and description.
 * Wraps a set of related settings fields.
 */
const SettingsSection = ({
  title,
  description,
  icon: Icon,
  children,
  className,
}) => (
  <div className={cn(
    'rounded-2xl border border-surface-200 bg-white p-6',
    'dark:border-dark-600 dark:bg-dark-700',
    className
  )}>
    {/* Header */}
    <div className="mb-5 flex items-start gap-3">
      {Icon && (
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center
                        rounded-xl bg-brand-50 dark:bg-brand-900/20">
          <Icon className="h-4.5 w-4.5 text-brand-500" />
        </div>
      )}
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {title}
        </h3>
        {description && (
          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        )}
      </div>
    </div>

    {/* Fields */}
    <div className="space-y-5">
      {children}
    </div>
  </div>
)

export default SettingsSection