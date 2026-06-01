import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * Pagination — aligned with Laravel's paginated response shape:
 * { current_page, last_page, per_page, total }
 *
 * Backend returns: res.data.meta.current_page / last_page
 */
const Pagination = ({
  currentPage,
  lastPage,
  total,
  perPage,
  onPageChange,
  className,
}) => {
  if (!lastPage || lastPage <= 1) return null

  const from = (currentPage - 1) * perPage + 1
  const to   = Math.min(currentPage * perPage, total)

  // Build page number array with ellipsis
  const getPages = () => {
    const pages = []
    const delta = 1 // pages around current
    for (let i = 1; i <= lastPage; i++) {
      if (
        i === 1 || i === lastPage ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }

  return (
    <div className={cn(
      'flex items-center justify-between',
      className
    )}>
      {/* Count */}
      <p className="text-xs text-slate-400">
        {from}–{to} sur {total} résultats
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg
                     text-slate-500 transition-colors hover:bg-surface-100
                     disabled:opacity-30 disabled:cursor-not-allowed
                     dark:text-slate-400 dark:hover:bg-dark-600"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPages().map((page, i) => (
          page === '...' ? (
            <span key={`ellipsis-${i}`}
                  className="flex h-8 w-8 items-center justify-center
                             text-xs text-slate-400">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium',
                'transition-colors duration-150',
                page === currentPage
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-surface-100 dark:text-slate-400 dark:hover:bg-dark-600'
              )}
            >
              {page}
            </button>
          )
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          className="flex h-8 w-8 items-center justify-center rounded-lg
                     text-slate-500 transition-colors hover:bg-surface-100
                     disabled:opacity-30 disabled:cursor-not-allowed
                     dark:text-slate-400 dark:hover:bg-dark-600"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default Pagination