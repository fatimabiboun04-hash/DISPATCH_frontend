import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Search, X, Loader2, Users, LayoutDashboard,
  Calendar, FileText, CheckSquare, Clock, BarChart3,
  Briefcase, UserPlus, Clock4, Zap,
  History, ArrowUpDown, Trash2,
} from 'lucide-react'
import {
  globalSearchThunk,
  addRecentSearch,
  clearRecentSearches,
  clearSearch,
} from '../../features/search/searchSlice'

const QUICK_ACTIONS = [
  { label: 'Aller au Dashboard', to: '/admin/dashboard', icon: LayoutDashboard, keywords: 'dashboard accueil home' },
  { label: 'Employés', to: '/admin/employees', icon: Users, keywords: 'employes personnel staff' },
  { label: 'Nouvel Employé', to: '/admin/employees', icon: UserPlus, keywords: 'creer ajouter employer nouveau' },
  { label: 'Planning', to: '/admin/planning', icon: Calendar, keywords: 'planning horaire schedule' },
  { label: 'Tâches', to: '/admin/tasks', icon: CheckSquare, keywords: 'taches tasks missions' },
  { label: 'Rapports', to: '/admin/reports', icon: FileText, keywords: 'rapports reports' },
  { label: 'Pointage Live', to: '/admin/pointage-live', icon: Clock, keywords: 'pointage live checkin clock' },
  { label: 'Congés', to: '/admin/leave-requests', icon: Briefcase, keywords: 'conges leave absences' },
  { label: 'Compétences', to: '/admin/skills', icon: Zap, keywords: 'competences skills' },
  { label: 'Équipes', to: '/admin/teams', icon: Users, keywords: 'equipes teams groupes' },
  { label: 'Historique', to: '/admin/history', icon: Clock4, keywords: 'historique history logs' },
  { label: 'Paramètres', to: '/admin/settings', icon: BarChart3, keywords: 'parametres settings configuration' },
]

const ITEM_ICONS = {
  employee: Users,
  team: Users,
  skill: Zap,
  task: CheckSquare,
  planning: Calendar,
  leave: Briefcase,
  report: FileText,
  notification: Clock,
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const highlightMatch = (text, query) => {
  if (!query || !text) return text
  const escaped = escapeRegex(query)
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 rounded px-0.5">{part}</mark>
      : part
  )
}

const GlobalSearch = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { results, loading, error, recentSearches } = useSelector((state) => state.search)

  const [inputValue, setInputValue] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const debounceRef = useRef(null)
  const abortRef = useRef(null)

  // Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Debounced search with abort
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (abortRef.current) abortRef.current.abort()

    if (inputValue.trim().length >= 2) {
      const controller = new AbortController()
      abortRef.current = controller

      debounceRef.current = setTimeout(() => {
        dispatch(globalSearchThunk({ query: inputValue.trim(), signal: controller.signal }))
      }, 300)
    } else {
      dispatch(clearSearch())
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [inputValue, dispatch])

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(-1)
  }, [results, inputValue])

  // Build flat list of selectable items
  const selectableItems = useMemo(() => {
    const items = []

    if (!inputValue.trim()) {
      // Show recent searches
      recentSearches.forEach((r) => {
        items.push({ type: 'recent', query: r.query, label: r.query, sub: null, to: null, icon: History })
      })
      return items
    }

    const q = inputValue.trim().toLowerCase()

    // Matching quick actions
    QUICK_ACTIONS.filter((qa) =>
      qa.label.toLowerCase().includes(q) || qa.keywords.toLowerCase().includes(q)
    ).forEach((qa) => {
      items.push({ type: 'action', ...qa })
    })

    // Group API results by category
    const grouped = {}
    results.forEach((r) => {
      const cat = r.category || 'AUTRE'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(r)
    })

    Object.entries(grouped).forEach(([, catResults]) => {
      catResults.forEach((r) => {
        items.push({ type: 'result', ...r, icon: ITEM_ICONS[r.type] || FileText })
      })
    })

    return items
  }, [inputValue, results, recentSearches])

  const executeItem = useCallback((item) => {
    if (item.type === 'recent') {
      setInputValue(item.query)
      inputRef.current?.focus()
      return
    }
    if (item.to) {
      dispatch(addRecentSearch(inputValue.trim() || item.label))
      setOpen(false)
      navigate(item.to)
    }
  }, [navigate, dispatch, inputValue])

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!open) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) =>
          prev < selectableItems.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : selectableItems.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < selectableItems.length) {
          executeItem(selectableItems[activeIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        inputRef.current?.blur()
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  const handleClear = () => {
    setInputValue('')
    setOpen(false)
    inputRef.current?.focus()
  }

  const handleFocus = () => {
    setOpen(true)
  }

  const showDropdown = open && (inputValue.trim().length >= 2 || recentSearches.length > 0 || loading)

  return (
    <div ref={containerRef} className="relative hidden md:block">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher…"
          className="h-9 w-52 rounded-lg border border-surface-200
                     bg-surface-50 pl-9 pr-8 text-xs
                     text-slate-700 placeholder-slate-400
                     transition-all duration-200
                     focus:w-64 focus:border-brand-300 focus:outline-none
                     focus:ring-2 focus:ring-brand-500/20
                     dark:border-dark-500 dark:bg-dark-700
                     dark:text-slate-200 dark:placeholder-slate-500"
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            tabIndex={-1}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Keyboard hint */}
      {!inputValue && !open && (
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2
                        hidden items-center gap-0.5 rounded border border-surface-200
                        bg-surface-50 px-1.5 py-0.5 text-[10px] font-medium
                        text-slate-400 dark:border-dark-500 dark:bg-dark-700
                        dark:text-slate-500 md:flex"
        >
          <span>⌘</span>K
        </kbd>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-1 w-80 rounded-lg border border-surface-200 bg-white py-1 shadow-lg dark:border-dark-500 dark:bg-dark-700 max-h-96 overflow-y-auto">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-2 px-4 py-3 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Recherche en cours…
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-red-500">
              Erreur: {error}
            </div>
          )}

          {/* Empty (no results from API but query >= 2) */}
          {!loading && !error && inputValue.trim().length >= 2 && selectableItems.length === 0 && (
            <div className="px-4 py-3 text-xs text-slate-400 text-center">
              Aucun résultat pour "{inputValue.trim()}"
            </div>
          )}

          {/* No recent searches */}
          {!loading && !error && !inputValue.trim() && recentSearches.length === 0 && (
            <div className="px-4 py-3 text-xs text-slate-400 text-center">
              Commencez à taper pour rechercher
            </div>
          )}

          {/* Results list */}
          {selectableItems.length > 0 && (
            <div className="py-1">
              {!inputValue.trim() && recentSearches.length > 0 && (
                <div className="flex items-center justify-between px-4 py-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <History className="inline h-3 w-3 mr-1" />
                    Récent
                  </span>
                  <button
                    onClick={() => dispatch(clearRecentSearches())}
                    className="text-[10px] text-slate-400 hover:text-red-400 transition-colors"
                    title="Effacer l'historique"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}

              {!inputValue.trim() && recentSearches.length > 0 && (
                recentSearches.map((item, idx) => {
                  const globalIdx = idx
                  return (
                    <button
                      key={`recent-${idx}`}
                      onClick={() => { setInputValue(item.query); inputRef.current?.focus() }}
                      onMouseEnter={() => setActiveIndex(globalIdx)}
                      className={`flex w-full items-center gap-3 px-4 py-2 text-left text-xs transition-colors ${
                        activeIndex === globalIdx
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-surface-50 dark:hover:bg-dark-600'
                      }`}
                    >
                      <History className="h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{item.query}</div>
                      </div>
                      <ArrowUpDown className="h-3 w-3 shrink-0 text-slate-400" />
                    </button>
                  )
                })
              )}

              {inputValue.trim().length >= 2 && (() => {
                let globalIndex = 0

                // Quick actions section
                const matchedActions = QUICK_ACTIONS.filter((qa) => {
                  const q = inputValue.trim().toLowerCase()
                  return qa.label.toLowerCase().includes(q) || qa.keywords.toLowerCase().includes(q)
                })

                return (
                  <>
                    {matchedActions.length > 0 && (
                      <>
                        <div className="px-4 py-1.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            <Zap className="inline h-3 w-3 mr-1" />
                            Actions Rapides
                          </span>
                        </div>
                        {matchedActions.map((qa, idx) => {
                          const itemIdx = globalIndex++
                          return (
                            <button
                              key={`action-${idx}`}
                              onClick={() => { dispatch(addRecentSearch(inputValue.trim())); setOpen(false); navigate(qa.to) }}
                              onMouseEnter={() => setActiveIndex(itemIdx)}
                              className={`flex w-full items-center gap-3 px-4 py-2 text-left text-xs transition-colors ${
                                activeIndex === itemIdx
                                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                                  : 'text-slate-600 dark:text-slate-300 hover:bg-surface-50 dark:hover:bg-dark-600'
                              }`}
                            >
                              <qa.icon className="h-4 w-4 shrink-0 text-slate-400" />
                              <div className="min-w-0 flex-1">
                                <div className="truncate font-medium">
                                  {highlightMatch(qa.label, inputValue.trim())}
                                </div>
                              </div>
                              <ArrowUpDown className="h-3 w-3 shrink-0 text-slate-400" />
                            </button>
                          )
                        })}
                      </>
                    )}

                    {/* API results grouped by category */}
                    {results.length > 0 && (
                      <>
                        {matchedActions.length > 0 && (
                          <div className="mx-3 my-1 border-t border-surface-200 dark:border-dark-500" />
                        )}
                        {(() => {
                          const grouped = {}
                          results.forEach((r) => {
                            const cat = r.category || 'AUTRE'
                            if (!grouped[cat]) grouped[cat] = []
                            grouped[cat].push(r)
                          })
                          const catEntries = Object.entries(grouped)
                          return catEntries.map(([catName, catResults], catIdx) => (
                            <div key={catName}>
                              <div className={`px-4 py-1.5 ${catIdx > 0 ? 'mt-1' : ''}`}>
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                  {catName}
                                </span>
                              </div>
                              {catResults.map((r, rIdx) => {
                                const itemIdx = globalIndex++
                                const Icon = ITEM_ICONS[r.type] || FileText
                                return (
                                  <button
                                    key={`result-${r.type}-${r.id}`}
                                    onClick={() => { dispatch(addRecentSearch(inputValue.trim())); setOpen(false); navigate(r.to) }}
                                    onMouseEnter={() => setActiveIndex(itemIdx)}
                                    className={`flex w-full items-center gap-3 px-4 py-2 text-left text-xs transition-colors ${
                                      activeIndex === itemIdx
                                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-surface-50 dark:hover:bg-dark-600'
                                    }`}
                                  >
                                    <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                                    <div className="min-w-0 flex-1">
                                      <div className="truncate font-medium">
                                        {highlightMatch(r.label, inputValue.trim())}
                                      </div>
                                      {r.sub && (
                                        <div className="truncate text-slate-400 dark:text-slate-500">
                                          {highlightMatch(r.sub, inputValue.trim())}
                                        </div>
                                      )}
                                    </div>
                                    <ArrowUpDown className="h-3 w-3 shrink-0 text-slate-400" />
                                  </button>
                                )
                              })}
                            </div>
                          ))
                        })()}
                      </>
                    )}

                    {/* No results from API but there are quick actions */}
                    {results.length === 0 && matchedActions.length > 0 && !loading && !error && (
                      <div className="px-4 py-2 text-[10px] text-slate-400 text-center">
                        Utilisez les actions rapides ci-dessus
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default GlobalSearch
