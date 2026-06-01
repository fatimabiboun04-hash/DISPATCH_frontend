import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar               from '../components/layout/Sidebar'
import Topbar                from '../components/layout/Topbar'
import EmployeeSidebarLinks  from '../components/layout/EmployeeSidebarLinks'
import { useDarkMode }       from '../hooks/useDarkMode'

/**
 * EmployeeLayout — root layout for all /employee/* pages.
 * Same structure as AdminLayout but with employee-specific sidebar links.
 */
const EmployeeLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location                    = useLocation()
  useDarkMode()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-dark-900">

      <Sidebar
        LinkComponent={EmployeeSidebarLinks}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Topbar onMenuToggle={() => setMobileOpen((o) => !o)} />

      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="pt-16 transition-all duration-300 lg:pl-60"
      >
        <div className="min-h-[calc(100vh-4rem)] p-6">
          <Outlet />
        </div>
      </motion.main>
    </div>
  )
}

export default EmployeeLayout