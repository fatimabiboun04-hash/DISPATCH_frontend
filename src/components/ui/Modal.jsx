import { useEffect, useCallback, useId, memo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

const SIZES = {
  sm:   'max-w-sm',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-[90vw]',
}

const Modal = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  showClose = true,
  className,
}) => {
  const titleId = useId()

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
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeOnBackdrop ? onClose : undefined}
          className="fixed inset-0 z-50 flex items-center justify-center
                     bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            key="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.96, y: 8  }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'relative w-full rounded-2xl bg-white shadow-2xl',
              'dark:bg-dark-700',
              SIZES[size] || SIZES.md,
              className
            )}
          >
            {(title || showClose) && (
              <div className="flex items-start justify-between
                              border-b border-surface-100 px-6 py-4
                              dark:border-dark-600">
                <div>
                  {title && (
                    <h2 id={titleId} className="text-base font-semibold
                                   text-slate-800 dark:text-slate-100">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
                  )}
                </div>
                {showClose && (
                  <button
                    onClick={onClose}
                    aria-label="Fermer"
                    className="ml-4 flex h-7 w-7 flex-shrink-0 items-center
                               justify-center rounded-lg text-slate-400
                               transition-colors hover:bg-surface-100
                               hover:text-slate-600 dark:hover:bg-dark-600
                               dark:hover:text-slate-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
              {children}
            </div>

            {footer && (
              <div className="flex items-center justify-end gap-3
                              border-t border-surface-100 px-6 py-4
                              dark:border-dark-600">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default memo(Modal)