import { useState }  from 'react'
import { motion }    from 'framer-motion'
import { Tabs }      from '../../components/ui'
import DashboardHistoryView from '../../components/history/DashboardHistoryView'
import PlanningHistoryPage  from './PlanningHistoryPage'
import LeaveHistoryView     from '../../components/history/LeaveHistoryView'
import AuditTimeline        from '../../components/history/AuditTimeline'
import {
  LayoutGrid, Archive, FileText, Shield,
} from 'lucide-react'

/**
 * HistoryPage — /admin/history
 *
 * Four tabs, all fully implemented:
 *
 * 1. Planning History  — read-only planning grid (Phase 10 component reused)
 * 2. Dashboard History — weekly archive with planning counts + grid drill-down
 * 3. Leave History     — all leave requests (all statuses, status filter)
 * 4. Audit Trail       — full immutable chronological admin action log
 *
 * All tabs built in Phase 14.
 * Planning History tab uses PlanningHistoryPage from Phase 10.
 */

const TABS = [
  { value: 'planning',  label: 'Planning',          icon: LayoutGrid },
  { value: 'dashboard', label: 'Tableau de Bord',    icon: Archive    },
  { value: 'leaves',    label: 'Congés',             icon: FileText   },
  { value: 'audit',     label: 'Audit Trail',        icon: Shield     },
]

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState('planning')

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Historique
        </h1>
        <p className="mt-0.5 text-sm text-slate-400">
          Archives et traçabilité complète du système
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs
        tabs={TABS}
        value={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'planning'  && <PlanningHistoryPage />}
        {activeTab === 'dashboard' && <DashboardHistoryView />}
        {activeTab === 'leaves'    && <LeaveHistoryView />}
        {activeTab === 'audit'     && <AuditTimeline />}
      </motion.div>
    </div>
  )
}

export default HistoryPage