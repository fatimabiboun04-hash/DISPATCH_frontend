import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector }          from 'react-redux'
import { motion }                            from 'framer-motion'
import { Plus, Eye, EyeOff }                 from 'lucide-react'
import toast                                 from 'react-hot-toast'
import {
  fetchShiftsThunk,
  deactivateShiftThunk,
  updateShiftThunk,
} from '../../features/shifts/shiftThunks'
import {
  selectAllShifts,
  selectShiftsLoading,
  selectShiftsError,
  selectShowInactive,
  selectActiveShifts,
} from '../../features/shifts/shiftSelectors'
import { toggleShowInactive } from '../../features/shifts/shiftSlice'
import { getShiftColor }      from '../../constants/shiftColors'
import ShiftsGrid      from '../../components/shifts/ShiftsGrid'
import ShiftFormModal  from '../../components/shifts/ShiftFormModal'
import { Button, ConfirmDialog } from '../../components/ui'

const SHIFT_TYPE_LEGEND = [
  { type: 'day',       label: 'Jour'    },
  { type: 'night',     label: 'Nuit'    },
  { type: 'conge',     label: 'Congé'   },
  { type: 'absence',   label: 'Absence' },
  { type: 'emergency', label: 'Urgence' },
]

const ShiftsPage = () => {
  const dispatch      = useDispatch()
  const allShifts     = useSelector(selectAllShifts)
  const loading       = useSelector(selectShiftsLoading)
  const error         = useSelector(selectShiftsError)
  const showInactive  = useSelector(selectShowInactive)
  const activeShifts  = useSelector(selectActiveShifts)

  const [formOpen,           setFormOpen]           = useState(false)
  const [editShift,          setEditShift]          = useState(null)
  const [deactivateTarget,   setDeactivateTarget]   = useState(null)
  const [deactivating,       setDeactivating]       = useState(false)

  const fetchShifts = useCallback(() => {
    dispatch(fetchShiftsThunk())
  }, [dispatch])

  useEffect(() => {
    fetchShifts()
  }, [fetchShifts])

  const handleEdit = (shift) => {
    setEditShift(shift)
    setFormOpen(true)
  }

  const handleToggleActive = async (shift, newValue) => {
    const result = await dispatch(updateShiftThunk({
      id:   shift.id,
      data: { is_active: newValue },
    }))
    if (updateShiftThunk.fulfilled.match(result)) {
      toast.success(newValue
        ? `${shift.name} réactivé`
        : `${shift.name} désactivé`
      )
    } else {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return
    setDeactivating(true)
    const result = await dispatch(deactivateShiftThunk(deactivateTarget.id))
    setDeactivating(false)
    if (deactivateShiftThunk.fulfilled.match(result)) {
      toast.success(`${deactivateTarget.name} désactivé`)
      setDeactivateTarget(null)
    } else {
      toast.error('Erreur lors de la désactivation')
    }
  }

  const inactiveCount = allShifts.filter((s) => !s.is_active).length

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Shifts
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">
            {activeShifts.length} shift{activeShifts.length !== 1 ? 's' : ''} actif{activeShifts.length !== 1 ? 's' : ''}
            {inactiveCount > 0 && (
              <span className="ml-1.5 text-slate-300 dark:text-slate-600">
                · {inactiveCount} inactif{inactiveCount !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {inactiveCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={showInactive
                ? <EyeOff className="h-3.5 w-3.5" />
                : <Eye    className="h-3.5 w-3.5" />
              }
              onClick={() => dispatch(toggleShowInactive())}
            >
              {showInactive
                ? 'Masquer inactifs'
                : `Voir inactifs (${inactiveCount})`}
            </Button>
          )}
          <Button
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => { setEditShift(null); setFormOpen(true) }}
          >
            Nouveau shift
          </Button>
        </div>
      </motion.div>

      {/* Type legend */}
      {!loading && allShifts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-3"
        >
          {SHIFT_TYPE_LEGEND.map(({ type, label }) => {
            const { bg, text, dot, border } = getShiftColor(type)
            return (
              <div
                key={type}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 ${bg} ${border}`}
              >
                <span className={`h-2 w-2 rounded-full ${dot}`} />
                <span className={`text-xs font-medium ${text}`}>{label}</span>
              </div>
            )
          })}
          <span className="ml-1 text-xs text-slate-400">
            · Les couleurs indiquent le type dans le planning
          </span>
        </motion.div>
      )}

      {/* Grid */}
      <ShiftsGrid
        shifts={allShifts}
        loading={loading}
        error={error}
        showInactive={showInactive}
        onRetry={fetchShifts}
        onEdit={handleEdit}
        onDeactivate={setDeactivateTarget}
        onToggleActive={handleToggleActive}
      />

      {/* Create / Edit modal */}
      <ShiftFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditShift(null) }}
        shift={editShift}
        onSuccess={() => fetchShifts()}
      />

      {/* Deactivate confirmation — variant="warning" not "danger" */}
      <ConfirmDialog
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivateConfirm}
        loading={deactivating}
        variant="warning"
        title="Désactiver le shift"
        description={`Désactiver "${deactivateTarget?.name}" ? Le shift sera masqué du planning mais ses données seront conservées. Vous pouvez le réactiver à tout moment via le toggle.`}
        confirmLabel="Désactiver"
      />
    </div>
  )
}

export default ShiftsPage