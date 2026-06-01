import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { motion }    from 'framer-motion'
import { Clock, MapPin, AlertTriangle } from 'lucide-react'
import { fetchMyPointagesThunk } from '../../features/pointage/pointageThunks'
import {
  selectMyPointages,
  selectMyPointagesMeta,
  selectMyPointagesLoading,
} from '../../features/pointage/pointageSelectors'
import { setFilters } from '../../features/pointage/pointageSlice'
import { Badge, Skeleton, EmptyState, Pagination } from '../ui'
import { formatDate, formatTime, formatMinutesToHours } from '../../utils/formatters'
import { cn } from '../../utils/cn'

/**
 * PointageHistoryList — paginated check-in/out history for the employee.
 *
 * Data: GET /v1/me/pointages → paginatedResponse (paginate 15) with gpsLog
 *
 * Pointage status values: 'on_time' | 'late' | 'flagged' | 'early_leave'
 */

const STATUS_STYLES = {
  on_time:     { variant: 'success', label: 'À l\'heure'       },
  late:        { variant: 'warning', label: 'En retard'        },
  flagged:     { variant: 'danger',  label: 'Signalé'          },
  early_leave: { variant: 'info',    label: 'Sortie anticipée' },
}

const PointageHistoryList = () => {
  const dispatch = useDispatch()
  const pointages = useSelector(selectMyPointages)
  const meta      = useSelector(selectMyPointagesMeta)
  const loading   = useSelector(selectMyPointagesLoading)

  useEffect(() => {
    dispatch(fetchMyPointagesThunk({}))
  }, [dispatch])

  const handlePageChange = (page) => {
    dispatch(fetchMyPointagesThunk({ page }))
  }

  if (loading && pointages.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton.Block key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    )
  }

  if (pointages.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="Aucun pointage enregistré"
        description="Votre historique de pointages apparaîtra ici"
        size="sm"
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Historique des pointages
      </p>

      <div className="space-y-2">
        {pointages.map((p, i) => {
          const statusConfig = STATUS_STYLES[p.status] || STATUS_STYLES.on_time
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 rounded-xl border border-surface-100
                         bg-white px-4 py-3
                         dark:border-dark-600 dark:bg-dark-700"
            >
              {/* Date */}
              <div className="w-24 flex-shrink-0">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  {formatDate(p.check_in_at, 'EEE d MMM')}
                </p>
              </div>

              {/* Times */}
              <div className="flex flex-1 items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(p.check_in_at)}
                </span>
                {p.check_out_at && (
                  <>
                    <span className="text-slate-300">→</span>
                    <span>{formatTime(p.check_out_at)}</span>
                  </>
                )}
              </div>

              {/* Worked hours */}
              {p.worked_minutes > 0 && (
                <span className="text-xs font-semibold text-brand-600
                                 dark:text-brand-400">
                  {formatMinutesToHours(p.worked_minutes, true)}
                </span>
              )}

              {/* Status */}
              <Badge variant={statusConfig.variant} size="sm">
                {statusConfig.label}
              </Badge>

              {/* GPS flag */}
              {p.is_flagged && (
                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-500" />
              )}

              {/* Delay */}
              {p.delay_minutes > 0 && (
                <span className="text-2xs text-amber-500">
                  +{p.delay_minutes}min
                </span>
              )}
            </motion.div>
          )
        })}
      </div>

      {meta && meta.last_page > 1 && (
        <Pagination
          currentPage={meta.current_page}
          lastPage={meta.last_page}
          total={meta.total}
          perPage={meta.per_page}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}

export default PointageHistoryList