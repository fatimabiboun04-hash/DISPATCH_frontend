import { memo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'

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

  const getPages = () => {
    const pages = []
    const delta = 1
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
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn(
        'flex items-center justify-between',
        className
      )}
    >
      <p className="text-xs text-slate-400">
        {from}–{to} sur {total} résultats
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Page précédente"
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
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Page ${page}`}
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
          aria-label="Page suivante"
          className="flex h-8 w-8 items-center justify-center rounded-lg
                     text-slate-500 transition-colors hover:bg-surface-100
                     disabled:opacity-30 disabled:cursor-not-allowed
                     dark:text-slate-400 dark:hover:bg-dark-600"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  )
}

export default memo(Pagination)