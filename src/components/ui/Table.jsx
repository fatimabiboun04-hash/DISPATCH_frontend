import { memo } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '../../utils/cn'
import Skeleton from './Skeleton'
import EmptyState from './EmptyState'
import ErrorState from './ErrorState'
import Pagination from './Pagination'

/**
 * Table — premium enterprise data table.
 *
 * columns: [{ key, label, sortable?, width?, align?, render? }]
 * data: array of row objects
 * keyField: unique key field name (default: 'id')
 *
 * Handles: loading skeletons, empty state, error state, pagination.
 * Sorting is client-side via onSort callback (parent controls data).
 */

const ALIGN = {
  left:   'text-left',
  center: 'text-center',
  right:  'text-right',
}

const Table = ({
  columns    = [],
  data       = [],
  keyField   = 'id',
  loading    = false,
  error      = null,
  onRetry,
  emptyIcon,
  emptyTitle   = 'Aucune donnée',
  emptyDesc    = '',
  emptyAction,
  emptyActionLabel,
  sortKey,
  sortDir,
  onSort,
  // Pagination props (from backend meta)
  currentPage,
  lastPage,
  total,
  perPage,
  onPageChange,
  className,
  rowClassName,
  onRowClick,
}) => {
  const handleSort = (col) => {
    if (!col.sortable || !onSort) return
    const newDir = sortKey === col.key && sortDir === 'asc' ? 'desc' : 'asc'
    onSort(col.key, newDir)
  }

  return (
    <div className={cn('flex flex-col gap-0', className)}>
      {/* Table wrapper */}
      <div className="overflow-x-auto rounded-xl border border-surface-200
                      dark:border-dark-600">
        <table className="w-full min-w-full">
          {/* Head */}
          <thead>
            <tr className="border-b border-surface-200 bg-surface-50
                           dark:border-dark-600 dark:bg-dark-800">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col)}
                  style={{ width: col.width }}
                  className={cn(
                    'px-4 py-3 text-2xs font-semibold uppercase tracking-wider',
                    'text-slate-500 dark:text-slate-400',
                    ALIGN[col.align] || ALIGN.left,
                    col.sortable && 'cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200'
                  )}
                >
                  <div className={cn(
                    'flex items-center gap-1',
                    col.align === 'center' && 'justify-center',
                    col.align === 'right'  && 'justify-end'
                  )}>
                    {col.label}
                    {col.sortable && (
                      sortKey === col.key ? (
                        sortDir === 'asc'
                          ? <ChevronUp   className="h-3 w-3 text-brand-500" />
                          : <ChevronDown className="h-3 w-3 text-brand-500" />
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-40" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white dark:bg-dark-700 divide-y divide-surface-100 dark:divide-dark-600">
            {loading ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={columns.length} className="p-0">
                    <Skeleton.Row cols={columns.length} />
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={columns.length}>
                  <ErrorState message={error} onRetry={onRetry} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    icon={emptyIcon}
                    title={emptyTitle}
                    description={emptyDesc}
                    action={emptyAction}
                    actionLabel={emptyActionLabel}
                  />
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row[keyField]}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'transition-colors duration-100',
                    onRowClick && 'cursor-pointer hover:bg-surface-50 dark:hover:bg-dark-600',
                    typeof rowClassName === 'function'
                      ? rowClassName(row)
                      : rowClassName
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-sm text-slate-700 dark:text-slate-200',
                        ALIGN[col.align] || ALIGN.left
                      )}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && !error && lastPage > 1 && (
        <div className="mt-4 px-1">
          <Pagination
            currentPage={currentPage}
            lastPage={lastPage}
            total={total}
            perPage={perPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}

export default memo(Table)