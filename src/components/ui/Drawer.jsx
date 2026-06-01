import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * Drawer — right-side sliding panel.
 * Used primarily by PlanningCard → PlanningDrawer (Phase 9).
 *
 * Sizes: sm(320) | md(480) | lg(600) | xl(720)
 */

const WIDTHS = {
  sm: 'w-80',
  md: 'w-[480px]',
  lg: 'w-[600px]',
  xl: 'w-[720px]',
}

const Drawer = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  className,
}) => {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            key="drawer-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0     }}
            exit={{   x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
              'fixed inset-y-0 right-0 z-50 flex flex-col',
              'bg-white shadow-2xl dark:bg-dark-700',
              WIDTHS[size] || WIDTHS.md,
              'max-w-full',
              className
            )}
          >
            {/* Header */}
            <div className="flex flex-shrink-0 items-start justify-between
                            border-b border-surface-100 px-5 py-4
                            dark:border-dark-600">
              <div>
                {title && (
                  <h2 className="text-base font-semibold
                                 text-slate-800 dark:text-slate-100">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="ml-4 flex h-7 w-7 flex-shrink-0 items-center
                           justify-center rounded-lg text-slate-400
                           transition-colors hover:bg-surface-100
                           hover:text-slate-600 dark:hover:bg-dark-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex flex-shrink-0 items-center justify-end gap-3
                              border-t border-surface-100 px-5 py-4
                              dark:border-dark-600">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default Drawer