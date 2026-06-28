import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'
import AdminSidebarLinks from '../components/layout/AdminSidebarLinks'
import { useDarkMode } from '../hooks/useDarkMode'

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarW, setSidebarW] = useState(240)

  const location = useLocation()

  useDarkMode()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const topbarLeft = sidebarW + 16 // sidebar + 1rem padding

  return (
    <div
      className="min-h-screen bg-surface-50 dark:bg-dark-900"
      style={{ '--topbar-left': `${topbarLeft}px` }}
    >

      <Sidebar
        LinkComponent={AdminSidebarLinks}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onWidthChange={setSidebarW}
      />

      <Topbar onMenuToggle={() => setMobileOpen((o) => !o)} />

      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`
          pt-16 transition-all duration-300
          ${sidebarW <= 64 ? 'lg:pl-16' : 'lg:pl-60'}
        `}
      >
        <div className="min-h-[calc(100vh-4rem)] p-6">
          <Outlet />
        </div>
      </motion.main>
    </div>
  )
}

export default AdminLayout
