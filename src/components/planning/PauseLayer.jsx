import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Coffee, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import {
  fetchPausesByPlanningThunk,
  deletePauseThunk,
} from '../../features/pauses/pauseThunks'
import {
  selectPausesByPlanningId,
  selectPausesLoading,
} from '../../features/pauses/pauseSelectors'
import PauseRow      from './PauseRow'
import PauseFormModal from './PauseFormModal'
import { Button, Skeleton, ConfirmDialog } from '../ui'
import { cn }        from '../../utils/cn'
import toast         from 'react-hot-toast'

/**
 * PauseLayer — mini pause grid displayed below a planning card in the drawer.
 *
 * Per spec:
 * "The pause layer appears directly below the planning and visually aligns with it.
 *  It is a compact, simplified version of the planning grid.
 *  Display only (no heavy logic). Does NOT count in 44h."
 *
 * planningId: the selected planning record
 * planning:   the full planning object (for shift times, user, team)
 */
const PauseLayer = ({ planningId, planning, isLocked = false }) => {
  const dispatch   = useDispatch()
  const pauses     = useSelector(selectPausesByPlanningId(planningId))
  const loading    = useSelector(selectPausesLoading(planningId))

  const [collapsed,     setCollapsed]     = useState(false)
  const [editPause,     setEditPause]     = useState(null)
  const [formOpen,      setFormOpen]      = useState(false)
  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [deleting,      setDeleting]      = useState(false)

  const users = planning?.user ? [planning.user] : []
  const teams = planning?.team ? [planning.team] : []

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await dispatch(deletePauseThunk({
      pauseId:    deleteTarget.id,
      planningId,
    }))
    setDeleting(false)
    if (deletePauseThunk.fulfilled.match(result)) {
      toast.success('Pause supprimée')
      setDeleteTarget(null)
    } else {
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <>
      <div className={cn(
        'rounded-xl border border-surface-200 bg-surface-50',
        'dark:border-dark-600 dark:bg-dark-800'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3
                        border-b border-surface-200 dark:border-dark-600">
          <div className="flex items-center gap-2">
            <Coffee className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Pauses
            </span>
            {pauses.length > 0 && (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5
                               text-2xs font-bold text-amber-600
                               dark:bg-amber-900/30 dark:text-amber-400">
                {pauses.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!isLocked && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-2xs gap-1"
                onClick={() => { setEditPause(null); setFormOpen(true) }}
              >
                <Plus className="h-3 w-3" />
                Ajouter
              </Button>
            )}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="flex h-7 w-7 items-center justify-center rounded-lg
                         text-slate-400 hover:bg-surface-200 hover:text-slate-600
                         dark:hover:bg-dark-500 transition-colors"
            >
              {collapsed
                ? <ChevronDown className="h-3.5 w-3.5" />
                : <ChevronUp   className="h-3.5 w-3.5" />
              }
            </button>
          </div>
        </div>

        {/* Pause list */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-1.5 p-3">
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton.Block key={i} className="h-9 rounded-lg" />
                  ))
                ) : pauses.length === 0 ? (
                  <p className="py-2 text-center text-xs text-slate-400">
                    Aucune pause définie
                  </p>
                ) : (
                  pauses.map((pause) => (
                    <PauseRow
                      key={pause.id}
                      pause={pause}
                      onEdit={(p) => {
                        setEditPause(p)
                        setFormOpen(true)
                      }}
                      onDelete={setDeleteTarget}
                    />
                  ))
                )}
              </div>

              {/* Display-only note */}
              <div className="border-t border-surface-200 px-4 py-2
                              dark:border-dark-600">
                <p className="text-2xs text-slate-400">
                  ℹ Les pauses ne sont pas comptées dans les heures travaillées
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pause form modal */}
      <PauseFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditPause(null) }}
        planningId={planningId}
        pause={editPause}
        users={users}
        teams={teams}
        shiftStart={planning?.shift?.start_time}
        shiftEnd={planning?.shift?.end_time}
        onSuccess={() => dispatch(fetchPausesByPlanningThunk(planningId))}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Supprimer la pause"
        description="Supprimer cette pause ?"
        confirmLabel="Supprimer"
      />
    </>
  )
}

export default PauseLayer