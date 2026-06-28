import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  batchDeletePlanningsThunk,
  batchUpdateShiftThunk,
  batchAssignEmployeeThunk,
} from '../../features/planning/planningThunks'
import {
  selectSelectedIds,
  selectBatchLoading,
  selectSelectedPlannings,
} from '../../features/planning/planningSelectors'
import { clearSelectedIds, clearBatchResult } from '../../features/planning/planningSlice'
import { selectActiveShifts } from '../../features/shifts/shiftSelectors'
import { Button, Select, ConfirmDialog } from '../ui'
import { Trash2, X, ArrowRight, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

const BatchToolbar = ({ employees = [], onRefresh }) => {
  const dispatch = useDispatch()
  const selectedIds = useSelector(selectSelectedIds)
  const batchLoading = useSelector(selectBatchLoading)
  const selectedPlannings = useSelector(selectSelectedPlannings)
  const activeShifts = useSelector(selectActiveShifts)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [shiftId, setShiftId] = useState('')
  const [userId, setUserId] = useState('')

  if (selectedIds.length === 0) return null

  const handleBatchDelete = async () => {
    const result = await dispatch(batchDeletePlanningsThunk(selectedIds))
    setDeleteOpen(false)
    if (batchDeletePlanningsThunk.fulfilled.match(result)) {
      toast.success(`${result.payload.deleted_count} assignation(s) supprimée(s)`)
      dispatch(clearSelectedIds())
      onRefresh?.()
    }
  }

  const handleBatchUpdateShift = async () => {
    if (!shiftId) { toast.error('Sélectionnez un shift'); return }
    const result = await dispatch(batchUpdateShiftThunk({
      planning_ids: selectedIds,
      shift_id: Number(shiftId),
    }))
    if (batchUpdateShiftThunk.fulfilled.match(result)) {
      toast.success(`${result.payload.updated_count} assignation(s) mise(s) à jour`)
      dispatch(clearSelectedIds())
      setShiftId('')
      onRefresh?.()
    }
  }

  const handleBatchAssign = async () => {
    if (!userId) { toast.error('Sélectionnez un employé'); return }
    const result = await dispatch(batchAssignEmployeeThunk({
      planning_ids: selectedIds,
      user_id: Number(userId),
    }))
    if (batchAssignEmployeeThunk.fulfilled.match(result)) {
      toast.success(`${result.payload.updated_count} assignation(s) réaffectée(s)`)
      dispatch(clearSelectedIds())
      setUserId('')
      onRefresh?.()
    }
  }

  const shiftOptions = activeShifts.map((s) => ({
    value: String(s.id),
    label: `${s.name} (${s.start_time}–${s.end_time})`,
  }))

  const employeeOptions = employees.map((e) => ({
    value: String(e.id),
    label: e.name,
  }))

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 dark:border-brand-800 dark:bg-brand-900/20"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-brand-700 dark:text-brand-300">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-200 text-xs font-bold text-brand-700 dark:bg-brand-700 dark:text-brand-200">
              {selectedIds.length}
            </span>
            sélectionné(s)
          </div>

          <div className="h-5 w-px bg-brand-200 dark:bg-brand-700" />

          <Select
            options={[{ value: '', label: 'Changer shift…' }, ...shiftOptions]}
            value={shiftId}
            onChange={(e) => setShiftId(e.target.value)}
            className="w-44"
            size="sm"
            disabled={batchLoading}
          />
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowRight className="h-3.5 w-3.5" />}
            onClick={handleBatchUpdateShift}
            loading={batchLoading}
            disabled={!shiftId}
          >
            Appliquer
          </Button>

          <div className="h-5 w-px bg-brand-200 dark:bg-brand-700" />

          <Select
            options={[{ value: '', label: 'Assigner employé…' }, ...employeeOptions]}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-44"
            size="sm"
            disabled={batchLoading}
          />
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<UserPlus className="h-3.5 w-3.5" />}
            onClick={handleBatchAssign}
            loading={batchLoading}
            disabled={!userId}
          >
            Assigner
          </Button>

          <div className="h-5 w-px bg-brand-200 dark:bg-brand-700" />

          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            onClick={() => setDeleteOpen(true)}
            loading={batchLoading}
          >
            Supprimer
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 w-7 p-0 text-brand-500"
            onClick={() => dispatch(clearSelectedIds())}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </motion.div>
      </AnimatePresence>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleBatchDelete}
        loading={batchLoading}
        variant="danger"
        title="Supprimer en masse"
        description={`Supprimer ${selectedIds.length} assignation(s) sélectionnée(s) ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
      />
    </>
  )
}

export default BatchToolbar
