import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Check, AlertCircle, Users } from 'lucide-react'
import { Avatar, Badge, StatusDot, SkillBadge, StarRating } from '../ui'
import { cn } from '../../utils/cn'

const EmployeeSelect = ({
  employees = [],
  value,
  onChange,
  placeholder = 'Rechercher un employé…',
  label,
  required,
  error,
  disabled,
  className,
}) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlightIndex, setHighlightIndex] = useState(0)
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const listRef = useRef(null)

  const selected = employees.find((e) => e.id === value)

  const filtered = useMemo(() => {
    if (!query.trim()) return employees
    const q = query.toLowerCase()
    return employees.filter((e) => {
      if (e.name?.toLowerCase().includes(q)) return true
      if (e.email?.toLowerCase().includes(q)) return true
      if (e.teams?.some((t) => t.name?.toLowerCase().includes(q))) return true
      if (e.skills?.some((s) => s.name?.toLowerCase().includes(q))) return true
      return false
    })
  }, [employees, query])

  const sorted = useMemo(() => {
    const active = filtered.filter((e) => e.status === 'active')
    const suspended = filtered.filter((e) => e.status !== 'active')
    return [...active, ...suspended]
  }, [filtered])

  useEffect(() => {
    if (open) setHighlightIndex(0)
  }, [open, query])

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const select = useCallback((emp) => {
    onChange?.(emp.id)
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }, [onChange])

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setOpen(true)
        e.preventDefault()
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIndex((i) => Math.min(i + 1, sorted.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (sorted[highlightIndex]) select(sorted[highlightIndex])
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
    }
  }

  useEffect(() => {
    if (open && listRef.current) {
      const el = listRef.current.children[highlightIndex]
      if (el) el.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightIndex, open])

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {label && (
        <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}

      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border bg-white px-3 transition-all',
          'dark:bg-dark-700 dark:text-slate-100',
          error
            ? 'border-red-400 focus-within:ring-2 focus-within:ring-red-400/20'
            : 'border-surface-200 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-500/20 dark:border-dark-400',
          disabled && 'cursor-not-allowed opacity-50',
          open && 'rounded-b-none border-b-0'
        )}
      >
        <Search className="h-4 w-4 flex-shrink-0 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected ? selected.name : placeholder}
          disabled={disabled}
          className={cn(
            'h-10 flex-1 bg-transparent text-sm outline-none',
            'placeholder:text-slate-400 dark:placeholder:text-slate-500',
            selected && !query && 'font-medium text-slate-900 dark:text-slate-100'
          )}
        />
        {value && (
          <button
            onClick={(e) => { e.stopPropagation(); onChange?.(null); setQuery(''); setOpen(false) }}
            className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-dark-500"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute left-0 right-0 z-50 max-h-72 overflow-y-auto rounded-b-lg border border-t-0 bg-white shadow-lg',
              'dark:border-dark-400 dark:bg-dark-700',
              error ? 'border-red-400' : 'border-surface-200 dark:border-dark-400'
            )}
          >
            {sorted.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <Users className="h-8 w-8 text-slate-300" />
                <p className="text-xs text-slate-400">Aucun employé trouvé</p>
              </div>
            ) : (
              sorted.map((emp, i) => {
                const isSelected = emp.id === value
                const isHighlighted = i === highlightIndex
                const isSuspended = emp.status !== 'active'
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => select(emp)}
                    onMouseEnter={() => setHighlightIndex(i)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
                      isHighlighted && 'bg-brand-50 dark:bg-brand-900/20',
                      isSelected && 'bg-brand-50 dark:bg-brand-900/20',
                      isSuspended && 'opacity-60'
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar src={emp.avatar_url} name={emp.name} size="sm" />
                      <StatusDot status={isSuspended ? 'inactive' : 'active'} className="absolute -bottom-0.5 -right-0.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          'truncate text-sm font-medium',
                          isSuspended ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'
                        )}>
                          {emp.name}
                        </span>
                        {isSuspended && (
                          <Badge variant="warning" size="sm">Suspendu</Badge>
                        )}
                        {isSelected && (
                          <Check className="ml-auto h-3.5 w-3.5 text-brand-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                        {emp.teams?.slice(0, 2).map((t) => (
                          <span key={t.id} className="inline-flex items-center gap-1 text-2xs text-slate-400">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: t.color || '#6172f3' }} />
                            {t.name}
                          </span>
                        ))}
                        {emp.skills?.slice(0, 2).map((s) => (
                          <SkillBadge key={s.id} name={s.name} className="text-2xs px-1.5 py-0" />
                        ))}
                        {((emp.teams?.length || 0) + (emp.skills?.length || 0)) > 4 && (
                          <span className="text-2xs text-slate-400">
                            +{(emp.teams?.length || 0) + (emp.skills?.length || 0) - 4}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 flex-col items-end gap-0.5">
                      {emp.ratings?.[0]?.score && (
                        <StarRating value={emp.ratings[0].score} readonly size="sm" />
                      )}
                      {emp.weekly_hours_limit && (
                        <span className="text-2xs font-medium text-slate-400">
                          Limite: {emp.weekly_hours_limit}h
                        </span>
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

export default memo(EmployeeSelect)
