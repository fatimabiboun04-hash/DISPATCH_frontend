import { motion }  from 'framer-motion'
import { useState } from 'react'
import { Tabs }     from '../../components/ui'
import LivePresenceTable   from '../../components/pointage/LivePresenceTable'
import FlaggedPointagesList from '../../components/pointage/FlaggedPointagesList'

/**
 * PointageLivePage — admin pointage live dashboard.
 * Accessible via the admin sidebar or as a tab in dashboard.
 *
 * Tabs:
 * 1. Absences — absent employees with replacement suggestions
 * 2. Pointages suspects — flagged check-ins awaiting review
 */

const TABS = [
  { value: 'absences', label: 'Absences du jour' },
  { value: 'flagged',  label: 'Pointages suspects' },
]

const PointageLivePage = () => {
  const [activeTab, setActiveTab] = useState('absences')

  return (
    <div className="flex flex-col gap-5">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Pointage Live
        </h1>
        <p className="mt-0.5 text-sm text-slate-400">
          Suivi des présences et alertes en temps réel
        </p>
      </motion.div>

      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />

      <div>
        {activeTab === 'absences' && <LivePresenceTable />}
        {activeTab === 'flagged'  && <FlaggedPointagesList />}
      </div>
    </div>
  )
}

export default PointageLivePage