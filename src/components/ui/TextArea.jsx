import { forwardRef, useId, memo } from 'react'
import { cn } from '../../utils/cn'

const TextArea = forwardRef(({
  label,
  error,
  helper,
  rows = 4,
  className,
  containerClassName,
  id: externalId,
  ...props
}, ref) => {
  const generatedId = useId()
  const textareaId = externalId || generatedId
  const errorId = `${textareaId}-error`
  const helperId = `${textareaId}-helper`

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={textareaId} className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {label}
          {props.required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={!!error || undefined}
        aria-describedby={
          error ? errorId : helper ? helperId : undefined
        }
        className={cn(
          'w-full resize-none rounded-lg border bg-white px-3 py-2.5 text-sm',
          'text-slate-900 placeholder-slate-400',
          'transition-all duration-150 outline-none focus:ring-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:bg-dark-700 dark:text-slate-100 dark:placeholder-slate-500',
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
            : 'border-surface-200 focus:border-brand-400 focus:ring-brand-500/20 dark:border-dark-400',
          className
        )}
        {...props}
      />
      {error  && <p id={errorId} className="text-xs text-red-500">{error}</p>}
      {!error && helper && <p id={helperId} className="text-xs text-slate-400">{helper}</p>}
    </div>
  )
})

TextArea.displayName = 'TextArea'
export default memo(TextArea)