import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'
import AdminSidebarLinks from '../components/layout/AdminSidebarLinks'
import { useDarkMode } from '../hooks/useDarkMode'

/**
 * AdminLayout — root layout for all /admin/* pages.
 *
 * Structure:
 *   Fixed Sidebar (left)  +  Fixed Topbar (top)  +  Scrollable main content
 *
 * CSS variables drive sidebar width so Topbar padding stays in sync.
 */
const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarW, setSidebarW] = useState(240)

  const location = useLocation()

  useDarkMode()

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-dark-900">

      {/* Sidebar */}
      <Sidebar
        LinkComponent={AdminSidebarLinks}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onWidthChange={setSidebarW}
      />

      {/* Topbar */}
      <div
        className="lg:transition-all lg:duration-300"
        style={{
          '--topbar-left':
            window.innerWidth >= 1024
              ? `calc(${sidebarW}px + 1rem)`
              : '1rem',
        }}
      >
        <Topbar onMenuToggle={() => setMobileOpen((o) => !o)} />
      </div>

      {/* Main content */}
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="pt-16 transition-all duration-300"
        style={{
          paddingLeft:
            window.innerWidth >= 1024 ? `${sidebarW}px` : '0px',
        }}
      >
        <div className="min-h-[calc(100vh-4rem)] p-6">
          <Outlet />
        </div>
      </motion.main>
    </div>
  )
}

export default AdminLayout