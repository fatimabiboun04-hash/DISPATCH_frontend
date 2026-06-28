import { motion } from 'framer-motion'
import { AlertTriangle, Calendar, X } from 'lucide-react'
import { Modal, Button } from '../ui'
import { formatDate } from '../../utils/formatters'

const ConflictWarningDialog = ({
  open,
  onClose,
  onConfirm,
  conflicts = [],
  conflictCount = 0,
  loading = false,
  employeeName = '',
}) => {
  if (!open) return null

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center
                          rounded-full bg-red-50 dark:bg-red-900/20">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Conflit de planning détecté
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {employeeName} a {conflictCount} assignation{conflictCount > 1 ? 's' : ''} de planning
              pendant cette période de congé.
            </p>
          </div>
        </div>

        {/* Conflict list */}
        <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl
                        border border-red-100 bg-red-50/50 p-3
                        dark:border-red-900/30 dark:bg-red-900/10">
          <p className="text-2xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
            Assignations affectées
          </p>
          {conflicts.map((c, i) => (
            <motion.div
              key={c.planning_id || i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-2 rounded-lg bg-white px-3 py-2
                         text-xs shadow-sm dark:bg-dark-700"
            >
              <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-red-400" />
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {formatDate(c.date)}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">{c.shift_name}</span>
              {c.team_name && (
                <>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">{c.team_name}</span>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Info */}
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          L'approbation de ce congé supprimera automatiquement toutes les
          assignations de planning pendant cette période et suggérera des
          remplacements.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 border-t
                        border-surface-100 pt-4 dark:border-dark-600">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            <X className="h-4 w-4" />
            Annuler
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            <AlertTriangle className="h-4 w-4" />
            Confirmer et approuver
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ConflictWarningDialog
