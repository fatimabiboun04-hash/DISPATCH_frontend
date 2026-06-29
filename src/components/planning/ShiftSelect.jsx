import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChevronDown, X, Check } from 'lucide-react'
import { Badge, SkillBadge } from '../ui'
import { cn } from '../../utils/cn'

const ShiftSelect = ({
  shifts = [],
  value,
  onChange,
  placeholder = 'Sélectionner un shift…',
  label,
  required,
  error,
  disabled,
  className,
}) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const selected = shifts.find((s) => s.id === value)

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const select = useCallback((s) => {
    onChange?.(s.id)
    setOpen(false)
  }, [onChange])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen((o) => !o)
    }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {label && (
        <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full items-center gap-2 rounded-lg border bg-white px-3 text-left transition-all',
          'dark:bg-dark-700 dark:text-slate-100',
          error
            ? 'border-red-400'
            : 'border-surface-200 hover:border-brand-300 dark:border-dark-400 dark:hover:border-brand-500',
          open && 'rounded-b-none border-b-0',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {selected ? (
          <>
            <span
              className="h-3 w-3 flex-shrink-0 rounded-full"
              style={{ backgroundColor: selected.color || '#6172f3' }}
            />
            <span className="flex-1 truncate text-sm font-medium">{selected.name}</span>
            <span className="text-2xs text-slate-400">
              {selected.start_time}–{selected.end_time}
            </span>
            {selected.duration_hours > 0 && (
              <span className="text-2xs text-slate-400">
                · {selected.duration_hours}h
              </span>
            )}
            <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
          </>
        ) : (
          <>
            <Clock className="h-4 w-4 flex-shrink-0 text-slate-400" />
            <span className="flex-1 truncate text-sm text-slate-400">{placeholder}</span>
            <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 z-50 max-h-64 overflow-y-auto rounded-b-lg border border-t-0 bg-white shadow-lg dark:border-dark-400 dark:bg-dark-700"
          >
            {shifts.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-slate-400">
                Aucun shift disponible
              </div>
            ) : (
              shifts.map((s) => {
                const isSelected = s.id === value
                const hasSkills = s.skills?.length > 0
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => select(s)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
                      isSelected && 'bg-brand-50 dark:bg-brand-900/20'
                    )}
                  >
                    <span
                      className="h-3 w-3 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: s.color || '#6172f3' }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                          {s.name}
                        </span>
                        <span className="text-2xs text-slate-400">
                          {s.start_time}–{s.end_time}
                        </span>
                        {s.duration_hours > 0 && (
                          <span className="text-2xs text-slate-400">
                            · {s.duration_hours}h
                          </span>
                        )}
                        {isSelected && (
                          <Check className="ml-auto h-3.5 w-3.5 text-brand-500 flex-shrink-0" />
                        )}
                      </div>
                      {hasSkills && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {s.skills.map((sk) => (
                            <SkillBadge key={sk.id} name={sk.name} className="text-2xs px-1.5 py-0" />
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default memo(ShiftSelect)
