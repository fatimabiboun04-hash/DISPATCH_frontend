import { useState, useRef, useEffect, useId, memo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../utils/cn'

const Tooltip = ({
  children,
  content,
  placement = 'top',
  className,
}) => {
  const [visible, setVisible] = useState(false)
  const [pos,     setPos]     = useState({ x: 0, y: 0 })
  const triggerRef            = useRef(null)
  const tooltipId             = useId()

  const updatePosition = () => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPos({
      x: rect.left + rect.width  / 2 + window.scrollX,
      y: rect.top                    + window.scrollY,
    })
  }

  useEffect(() => {
    if (visible) updatePosition()
  }, [visible])

  if (!content) return children

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        aria-describedby={tooltipId}
        className="inline-flex"
      >
        {children}
      </span>

      {createPortal(
        <AnimatePresence>
          {visible && (
            <motion.div
              key="tooltip"
              id={tooltipId}
              role="tooltip"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.12 }}
              style={{
                position:  'absolute',
                left:       pos.x,
                top:        pos.y - 8,
                transform: 'translateX(-50%) translateY(-100%)',
                zIndex:    9999,
              }}
              className={cn(
                'pointer-events-none rounded-lg px-2.5 py-1.5',
                'bg-slate-800 text-xs font-medium text-white',
                'shadow-strong whitespace-nowrap',
                'dark:bg-dark-600',
                className
              )}
            >
              {content}
              <div className="absolute left-1/2 top-full h-0 w-0
                              -translate-x-1/2
                              border-x-4 border-t-4
                              border-x-transparent border-t-slate-800
                              dark:border-t-dark-600" />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

export default memo(Tooltip)