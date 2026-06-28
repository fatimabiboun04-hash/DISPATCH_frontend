import { useRef, memo } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * SearchInput — debounced search bar with clear button.
 * Used in Employees, Teams, Leave Requests pages.
 */
const SearchInput = ({
  value,
  onChange,
  onClear,
  placeholder = 'Rechercher…',
  className,
  size = 'md',
}) => {
  const inputRef = useRef(null)

  const sizes = {
    sm: 'h-8 text-xs pl-8 pr-3',
    md: 'h-10 text-sm pl-9 pr-9',
    lg: 'h-11 text-sm pl-10 pr-10',
  }

  const iconSizes = {
    sm: 'h-3.5 w-3.5 left-2.5',
    md: 'h-4 w-4 left-3',
    lg: 'h-4.5 w-4.5 left-3.5',
  }

  return (
    <div className={cn('relative', className)}>
      <Search className={cn(
        'pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400',
        iconSizes[size] || iconSizes.md
      )} />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-lg border border-surface-200 bg-white',
          'text-slate-700 placeholder-slate-400',
          'transition-all duration-150 outline-none',
          'focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20',
          'dark:border-dark-400 dark:bg-dark-700 dark:text-slate-200',
          'dark:placeholder-slate-500',
          sizes[size] || sizes.md
        )}
      />
      {value && (
        <button
          onClick={() => {
            onClear?.()
            inputRef.current?.focus()
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2
                     text-slate-400 hover:text-slate-600
                     dark:hover:text-slate-300 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export default memo(SearchInput)