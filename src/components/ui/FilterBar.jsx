import { SlidersHorizontal } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * FilterBar — horizontal row of filter controls.
 * Used across: Employees, Leave Requests, Pointage, Reports pages.
 *
 * Accepts children for custom filter controls.
 * Optional action slot for buttons (Add, Export, etc.)
 */
const FilterBar = ({
  children,
  actions,
  className,
  showIcon = true,
}) => (
  <div className={cn(
    'flex flex-wrap items-center gap-3',
    'rounded-xl border border-surface-200 bg-white px-4 py-3',
    'dark:border-dark-600 dark:bg-dark-700',
    className
  )}>
    {showIcon && (
      <SlidersHorizontal className="h-4 w-4 flex-shrink-0 text-slate-400" />
    )}
    <div className="flex flex-1 flex-wrap items-center gap-3">
      {children}
    </div>
    {actions && (
      <div className="flex flex-shrink-0 items-center gap-2">
        {actions}
      </div>
    )}
  </div>
)

export default FilterBar