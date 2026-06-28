import { memo } from 'react'
import { cn } from '../../utils/cn'

/**
 * FormField — wraps label + control + error for consistent form layout.
 * Used when you need a custom control (color picker, date, etc.)
 * For standard inputs, use Input directly.
 */
const FormField = ({ label, error, helper, required, children, className }) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    {label && (
      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
    )}
    {children}
    {error  && <p className="text-xs text-red-500">{error}</p>}
    {!error && helper && <p className="text-xs text-slate-400">{helper}</p>}
  </div>
)

export default memo(FormField)