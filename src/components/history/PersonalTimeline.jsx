import { useEffect, useState } from 'react'
import { motion }              from 'framer-motion'
import { History }             from 'lucide-react'
import axiosInstance           from '../../services/axiosInstance'
import { API }                 from '../../constants/apiRoutes'
import { Badge, Skeleton, EmptyState, Pagination, ErrorState } from '../ui'
import { formatRelative }   from '../../utils/formatters'
import { cn }               from '../../utils/cn'

/**
 * PersonalTimeline — employee's own merged activity timeline.
 *
 * Data: GET /v1/me/history (gap fix #2)
 * Returns: { data: [...], total, per_page, current_page }
 *
 * Item shape: { type, icon, title, description, date, meta }
 * type: 'pointage' | 'rating' | 'leave' | 'planning'
 *
 * Sorted by date DESC already.
 */

const TYPE_CONFIG = {
  pointage: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300' },
  rating:   { bg: 'bg-amber-50 dark:bg-amber-900/20',   text: 'text-amber-700 dark:text-amber-300'   },
  leave:    { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-300'  },
  planning: { bg: 'bg-brand-50 dark:bg-brand-900/20',   text: 'text-brand-700 dark:text-brand-300'   },
}

const PersonalTimeline = () => {
  const [items,   setItems]   = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const perPage = 20

  const fetchHistory = async (p = 1) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axiosInstance.get(API.ME.HISTORY, {
        params: { page: p, per_page: perPage },
      })
      const payload = res.data.data
      setItems(payload.data || [])
      setTotal(payload.total || 0)
      setPage(p)
    } catch {
      setItems([])
      setError('Impossible de charger l\'historique')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory(1)
  }, [])

  const lastPage = Math.ceil(total / perPage)

  if (loading && items.length === 0) {
    return (
      <div className="space-y-4 pt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton.Circle size="h-8 w-8 flex-shrink-0" />
            <div className="flex-1 space-y-1.5 pt-1">
              <Skeleton.Line width="w-48" height="h-3.5" />
              <Skeleton.Line width="w-64" height="h-3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error && items.length === 0) {
    return <ErrorState message={error} onRetry={() => fetchHistory(1)} />
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Aucune activité"
        description="Votre historique d'activité apparaîtra ici."
        size="sm"
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="pt-2">
        {items.map((item, i) => {
          const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.planning
          return (
            <motion.div
              key={`${item.type}-${item.date}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex gap-3 pb-4"
            >
              {/* Icon + line */}
              <div className="flex flex-col items-center">
                <div className={cn(
                  'flex h-8 w-8 flex-shrink-0 items-center justify-center',
                  'rounded-full text-sm',
                  cfg.bg
                )}>
                  <span>{item.icon}</span>
                </div>
                <div className="mt-1 w-px flex-1 min-h-3 bg-surface-200 dark:bg-dark-600" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn('text-sm font-medium', cfg.text)}>
                    {item.title}
                  </p>
                  <span className="flex-shrink-0 text-2xs text-slate-400 whitespace-nowrap">
                    {formatRelative(item.date)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {item.description}
                </p>
                {/* Meta badges */}
                {item.meta?.status && (
                  <Badge
                    variant={
                      ['approved', 'present'].includes(item.meta.status) ? 'success'
                      : ['rejected', 'absent'].includes(item.meta.status) ? 'danger'
                      : 'warning'
                    }
                    size="sm"
                    className="mt-1.5"
                  >
                    {item.meta.status}
                  </Badge>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {lastPage > 1 && (
        <Pagination
          currentPage={page}
          lastPage={lastPage}
          total={total}
          perPage={perPage}
          onPageChange={fetchHistory}
        />
      )}
    </div>
  )
}

export default PersonalTimeline