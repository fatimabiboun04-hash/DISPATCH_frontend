import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

/**
 * Input — styled text input with optional label, error, helper text, icons.
 * Used by all forms across the app.
 *
 * Integrates with react-hook-form via forwardRef.
 */
const Input = forwardRef(({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  className,
  containerClassName,
  size = 'md',
  ...props
}, ref) => {
  const hasError = !!error

  const inputSizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-sm',
  }

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {/* Label */}
      {label && (
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {label}
          {props.required && (
            <span className="ml-0.5 text-red-500">*</span>
          )}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-3
                          flex items-center text-slate-400">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg border bg-white font-normal',
            'text-slate-900 placeholder-slate-400',
            'transition-all duration-150 outline-none',
            'focus:ring-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:bg-dark-700 dark:text-slate-100 dark:placeholder-slate-500',
            hasError
              ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20 dark:border-red-500'
              : 'border-surface-200 focus:border-brand-400 focus:ring-brand-500/20 dark:border-dark-400 dark:focus:border-brand-400',
            leftIcon  && 'pl-9',
            rightIcon && 'pr-9',
            inputSizes[size] || inputSizes.md,
            className
          )}
          {...props}
        />

        {/* Right icon */}
        {rightIcon && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
          <span className="h-3 w-3 flex-shrink-0">⚠</span>
          {error}
        </p>
      )}

      {/* Helper text */}
      {!error && helper && (
        <p className="text-xs text-slate-400">{helper}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
export default Input