import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * Select — native HTML select with custom styling.
 * Simple, accessible, works with react-hook-form.
 * For complex multi-selects use Modal + checkboxes.
 */
const Select = forwardRef(({
  label,
  error,
  helper,
  options = [],     // [{ value, label, disabled? }]
  placeholder,
  className,
  containerClassName,
  size = 'md',
  ...props
}, ref) => {
  const sizes = {
    sm: 'h-8 pl-3 pr-8 text-xs',
    md: 'h-10 pl-3 pr-8 text-sm',
    lg: 'h-12 pl-4 pr-10 text-sm',
  }

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {label}
          {props.required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full appearance-none rounded-lg border bg-white',
            'text-slate-900 transition-all duration-150 outline-none',
            'focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
            'dark:bg-dark-700 dark:text-slate-100',
            error
              ? 'border-red-400 focus:ring-red-400/20'
              : 'border-surface-200 focus:border-brand-400 focus:ring-brand-500/20 dark:border-dark-400',
            sizes[size] || sizes.md,
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(({ value, label: optLabel, disabled }) => (
            <option key={value} value={value} disabled={disabled}>
              {optLabel}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2
                                 -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>
      {error  && <p className="text-xs text-red-500">{error}</p>}
      {!error && helper && <p className="text-xs text-slate-400">{helper}</p>}
    </div>
  )
})

Select.displayName = 'Select'
export default Select