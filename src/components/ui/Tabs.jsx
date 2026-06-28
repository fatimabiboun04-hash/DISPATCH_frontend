import { memo } from 'react'
import { cn } from '../../utils/cn'
import { motion } from 'framer-motion'

const Tabs = ({
  tabs,
  value,
  onChange,
  variant = 'line',
  className,
}) => (
  <div
    role="tablist"
    className={cn(
      'flex',
      variant === 'line'
        ? 'border-b border-surface-200 dark:border-dark-600 gap-0'
        : 'gap-1 rounded-lg bg-surface-100 p-1 dark:bg-dark-600',
      className
    )}
  >
    {tabs.map((tab) => {
      const isActive = tab.value === value
      return (
        <button
          key={tab.value}
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(tab.value)}
          className={cn(
            'relative flex items-center gap-2 px-4 py-2.5',
            'text-sm font-medium transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
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

export default memo(Tabs)