import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Shield }                   from 'lucide-react'
import { fetchAuditLogsThunk }      from '../../features/history/historyThunks'
import {
  selectAuditLogs,
  selectAuditMeta,
  selectAuditLoading,
  selectAuditError,
  selectAuditFilters,
} from '../../features/history/historySelectors'
import AuditFilters        from './AuditFilters'
import AuditTimelineItem   from './AuditTimelineItem'
import { Skeleton, EmptyState, ErrorState, Pagination } from '../ui'
import axiosInstance from '../../services/axiosInstance'
import { API }       from '../../constants/apiRoutes'
import { useState, useEffect as useEff } from 'react'

/**
 * AuditTimeline — full audit trail with filters.
 *
 * Data: GET /v1/audit-logs (admin only)
 * Filters: action, entity_type, user_id, date_from, date_to
 * Returns paginatedResponse (paginate 50) with user loaded.
 *
 * AuditLog model:
 * - timestamps = false (only created_at, no updated_at)
 * - old_values/new_values cast as array
 * - Fix #6: immutability uses return false (silent fail in Laravel 10)
 *   Frontend shows data read-only — no edit/delete UI.
 */
const AuditTimeline = () => {
  const dispatch = useDispatch()
  const logs     = useSelector(selectAuditLogs)
  const meta     = useSelector(selectAuditMeta)
  const loading  = useSelector(selectAuditLoading)
  const error    = useSelector(selectAuditError)
  const filters  = useSelector(selectAuditFilters)

  const [employees, setEmployees] = useState([])

  // Fetch employees for filter dropdown
  useEff(() => {
    const fetch = async () => {
      try {
        const res = await axiosInstance.get(API.EMPLOYEES.LIST, {
          params: { per_page: 100 },
        })
        setEmployees(res.data.data || [])
      } catch (err) {
        console.error('Failed to load employees for filter', err)
      }
    }
    fetch()
  }, [])

  const fetchLogs = useCallback((page = 1) => {
    dispatch(fetchAuditLogsThunk({
      page,
      action:      filters.action      || undefined,
      entity_type: filters.entity_type || undefined,
      user_id:     filters.user_id     || undefined,
      date_from:   filters.date_from   || undefined,
      date_to:     filters.date_to     || undefined,
    }))
  }, [dispatch, filters])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <AuditFilters
        employees={employees}
        onFiltersChange={() => fetchLogs(1)}
      />

      {/* Immutability notice */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200
                      bg-slate-50 px-4 py-2.5 dark:border-dark-500 dark:bg-dark-700">
        <Shield className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
        <p className="text-xs text-slate-400">
          Les logs d'audit sont immuables — aucune modification ou suppression n'est possible.
        </p>
      </div>

      {/* Timeline */}
      {loading && logs.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton.Circle size="h-8 w-8" />
              <div className="flex-1 space-y-1.5 pt-1">
                <Skeleton.Line width="w-64" height="h-3.5" />
                <Skeleton.Line width="w-48" height="h-3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchLogs(1)} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="Aucun log d'audit"
          description="Les actions administrateur apparaîtront ici."
        />
      ) : (
        <>
          <div className="pt-2">
            {logs.map((log, i) => (
              <AuditTimelineItem
                key={log.id}
                log={log}
                index={i}
              />
            ))}
          </div>

          {meta && meta.last_page > 1 && (
            <Pagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              total={meta.total}
              perPage={meta.per_page}
              onPageChange={fetchLogs}
            />
          )}
        </>
      )}
    </div>
  )
}

export default AuditTimeline