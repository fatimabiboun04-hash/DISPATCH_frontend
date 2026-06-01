import { cn } from '../../utils/cn'
import { motion } from 'framer-motion'

/**
 * Tabs — animated tab navigation.
 * Controlled component: value + onChange.
 *
 * Variants: line (default) | pill
 */

const Tabs = ({
  tabs,        // [{ value, label, icon?, count? }]
  value,
  onChange,
  variant = 'line',
  className,
}) => (
  <div className={cn(
    'flex',
    variant === 'line'
      ? 'border-b border-surface-200 dark:border-dark-600 gap-0'
      : 'gap-1 rounded-lg bg-surface-100 p-1 dark:bg-dark-600',
    className
  )}>
    {tabs.map((tab) => {
      const isActive = tab.value === value
      return (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'relative flex items-center gap-2 px-4 py-2.5',
            'text-sm font-medium transition-all duration-150',
            'focus:outline-none',
            variant === 'line' ? [
              isActive
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
            ] : [
              'rounded-md',
              isActive
                ? 'bg-white text-slate-800 shadow-soft dark:bg-dark-500 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400',
            ]
          )}
        >
          {tab.icon && <tab.icon className="h-4 w-4 flex-shrink-0" />}
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span className={cn(
              'rounded-full px-1.5 py-0.5 text-2xs font-semibold',
              isActive
                ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400'
                : 'bg-surface-200 text-slate-500 dark:bg-dark-500'
            )}>
              {tab.count}
            </span>
          )}

          {/* Animated underline for line variant */}
          {variant === 'line' && isActive && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5
                         rounded-full bg-brand-500 dark:bg-brand-400"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      )
    })}
  </div>
)

export default Tabs