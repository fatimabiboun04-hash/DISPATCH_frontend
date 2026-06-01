import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * Sidebar — collapsible sidebar shell.
 * Receives `links` component as a child for Admin or Employee variants.
 *
 * Desktop: fixed, always visible, collapsible to 64px
 * Mobile:  hidden by default, slides in from left as overlay
 */
const Sidebar = ({
  LinkComponent,
  mobileOpen,
  onMobileClose,
  onWidthChange,
}) => {
  const [collapsed, setCollapsed] = useState(false)
  const width = collapsed ? 64 : 240

  // Sync sidebar width with layout
  useEffect(() => {
    if (onWidthChange) {
      onWidthChange(width)
    }
  }, [width, onWidthChange])

  return (
    <>
      {/* ── Mobile overlay backdrop ─────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onMobileClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Mobile sidebar (slide in) ───────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-60 flex-col
                       border-r border-surface-200 bg-white
                       dark:border-dark-600 dark:bg-dark-800
                       flex lg:hidden"
          >
            <SidebarContent
              LinkComponent={LinkComponent}
              collapsed={false}
              onCollapse={() => {}}
              showCollapseBtn={false}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar (always visible, collapsible) ───── */}
      <motion.aside
        animate={{ width }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-30 hidden flex-col
                   border-r border-surface-200 bg-white
                   dark:border-dark-600 dark:bg-dark-800
                   lg:flex"
      >
        <SidebarContent
          LinkComponent={LinkComponent}
          collapsed={collapsed}
          onCollapse={() => setCollapsed((c) => !c)}
          showCollapseBtn
        />
      </motion.aside>
    </>
  )
}

/* ── Inner content — same for mobile and desktop ─────────────── */
const SidebarContent = ({
  LinkComponent,
  collapsed,
  onCollapse,
  showCollapseBtn,
}) => (
  <div className="flex h-full flex-col">

    {/* Logo */}
    <div
      className={cn(
        'flex h-16 flex-shrink-0 items-center border-b border-surface-100',
        'dark:border-dark-700',
        collapsed ? 'justify-center px-0' : 'gap-2.5 px-4'
      )}
    >
      <Link to="/" className="flex items-center gap-2 focus:outline-none">
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center
                     rounded-lg bg-brand-500 shadow-glow-sm"
        >
          <Zap className="h-4 w-4 text-white" />
        </div>

        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-bold tracking-tight text-slate-800 dark:text-white"
          >
            Dispatch <span className="text-brand-500">Live</span>
          </motion.span>
        )}
      </Link>
    </div>

    {/* Nav links — scrollable */}
    <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 no-scrollbar">
      <LinkComponent collapsed={collapsed} />
    </div>

    {/* Collapse button (desktop only) */}
    {showCollapseBtn && (
      <div className="border-t border-surface-100 p-3 dark:border-dark-700">
        <button
          onClick={onCollapse}
          className={cn(
            'flex h-9 w-full items-center rounded-lg',
            'text-slate-400 transition-all duration-150',
            'hover:bg-surface-100 hover:text-slate-600',
            'dark:hover:bg-dark-600 dark:hover:text-slate-300',
            collapsed ? 'justify-center' : 'gap-2.5 px-3'
          )}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4" />
              <span className="text-xs font-medium">Réduire</span>
            </>
          )}
        </button>
      </div>
    )}
  </div>
)

export default Sidebar