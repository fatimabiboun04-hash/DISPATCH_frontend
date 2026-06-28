import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  Calendar, Clock, Users, Lock, Unlock,
  Trash2, UserPlus, Coffee,
} from 'lucide-react'
import { fetchPausesByPlanningThunk } from '../../features/pauses/pauseThunks'
import {
  deletePlanningThunk,
  createPlanningThunk,
  lockPlanningThunk,
  overrideLockThunk,
} from '../../features/planning/planningThunks'
import {
  selectPlanningSubmitting,
} from '../../features/planning/planningSelectors'
import SmartSuggestionList from './SmartSuggestionList'
import PauseLayer          from './PauseLayer'
import { Drawer, Avatar, Badge, Button,
         ConfirmDialog, Tooltip } from '../ui'
import { getShiftColor }   from '../../constants/shiftColors'
import { formatDate }      from '../../utils/formatters'
import { cn }              from '../../utils/cn'
import toast               from 'react-hot-toast'

/**
 * PlanningDrawer — right-side detail panel for a planning card.
 *
 * Opens when admin clicks a PlanningCard in the grid.
 *
 * Sections:
 * 1. Header: day, date, shift badge, team
 * 2. Employee details: avatar, name, hours bar, rating, status
 * 3. Smart suggestions (when "Add Employee" clicked)
 * 4. Pause layer (collapsible)
 * 5. Footer actions: delete, override lock
 *
 * planning shape: { id, date, is_locked, notes,
 *   user: { id, name, avatar_url },
 *   shift: { id, name, type, start_time, end_time, color },
 *   team: { id, name, color } | null }
 */
const PlanningDrawer = ({
  open,
  onClose,
  planning,       // full planning object
  onDeleted,      // callback after delete
  onRefresh,      // callback to re-fetch planning list
}) => {
  const dispatch    = useDispatch()
  const submitting  = useSelector(selectPlanningSubmitting)

  const [showSuggestions, setShowSuggestions] = useState(false)
  const [assigningId,     setAssigningId]     = useState(null)
  const [deleteOpen,      setDeleteOpen]      = useState(false)
  const [deleting,        setDeleting]        = useState(false)
  const [overriding,      setOverriding]      = useState(false)
  const [locking,         setLocking]         = useState(false)

  const shiftColor = planning ? getShiftColor(planning.shift?.type) : null

  // Load pauses when drawer opens
  useEffect(() => {
    if (open && planning?.id) {
      dispatch(fetchPausesByPlanningThunk(planning.id))
    }
    // Reset suggestions panel when a different card is opened
    setShowSuggestions(false)
  }, [open, planning?.id, dispatch])

  if (!planning) return null

  const isLocked = planning.is_locked

  // Handle assigning a suggested employee
  const handleSelectSuggestion = async (suggestion) => {
    setAssigningId(suggestion.employee.id)
    const result = await dispatch(createPlanningThunk({
      user_id:  suggestion.employee.id,
      shift_id: planning.shift_id,
      date:     planning.date,
      team_id:  planning.team_id || undefined,
    }))
    setAssigningId(null)
    if (createPlanningThunk.fulfilled.match(result)) {
      toast.success(`${suggestion.employee.name} assigné`)
      onRefresh?.()
      setShowSuggestions(false)
    }
  }

  // Handle delete
  const handleDeleteConfirm = async () => {
    setDeleting(true)
    const result = await dispatch(deletePlanningThunk(planning.id))
    setDeleting(false)
    setDeleteOpen(false)
    if (deletePlanningThunk.fulfilled.match(result)) {
      toast.success('Assignation supprimée')
      onDeleted?.(planning.id)
      onClose()
    } else {
      toast.error('Erreur lors de la suppression')
    }
  }

  // Handle lock override
  const handleOverrideLock = async () => {
    setOverriding(true)
    const result = await dispatch(overrideLockThunk(planning.id))
    setOverriding(false)
    if (overrideLockThunk.fulfilled.match(result)) {
      toast.success('Verrouillage levé')
      onRefresh?.()
    } else {
      toast.error('Erreur lors du déblocage')
    }
  }

  // Handle individual lock
  const handleLockPlanning = async () => {
    setLocking(true)
    const result = await dispatch(lockPlanningThunk(planning.id))
    setLocking(false)
    if (lockPlanningThunk.fulfilled.match(result)) {
      toast.success('Assignation verrouillée')
      onRefresh?.()
    } else {
      toast.error('Erreur lors du verrouillage')
    }
  }

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        size="md"
        title={formatDate(planning.date, 'EEEE d MMMM yyyy')}
        subtitle={`Semaine ${planning.week_number}`}
        footer={
          <div className="flex w-full items-center justify-between">
            {/* Lock / Unlock */}
            {isLocked ? (
              <Tooltip content="Débloquer cette assignation">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Unlock className="h-3.5 w-3.5" />}
                  loading={overriding}
                  onClick={handleOverrideLock}
                >
                  Débloquer
                </Button>
              </Tooltip>
            ) : (
              <Tooltip content="Verrouiller cette assignation">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Lock className="h-3.5 w-3.5" />}
                  loading={locking}
                  onClick={handleLockPlanning}
                >
                  Verrouiller
                </Button>
              </Tooltip>
            )}

            {/* Delete — disabled on locked */}
            <Tooltip content={isLocked ? 'Déverrouillez d\'abord' : 'Supprimer cette assignation'}>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                disabled={isLocked}
                onClick={() => setDeleteOpen(true)}
              >
                Supprimer
              </Button>
            </Tooltip>
          </div>
        }
      >
        <div className="flex flex-col gap-5">

          {/* ── Shift + Team header ──────────────────────── */}
          <div className={cn(
            'rounded-xl border p-4',
            shiftColor?.bg, shiftColor?.border
          )}>
            <div className="flex items-start justify-between gap-3">
              <div>
                {/* Shift name + time */}
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: planning.shift?.color || shiftColor?.hex }}
                  />
                  <span className={cn('text-sm font-bold', shiftColor?.text)}>
                    {planning.shift?.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Clock className={cn('h-3.5 w-3.5', shiftColor?.text)} />
                  <span className={cn(shiftColor?.text)}>
                    {planning.shift?.start_time} → {planning.shift?.end_time}
                  </span>
                  {planning.shift?.duration_hours > 0 && (
                    <span className={cn('opacity-60', shiftColor?.text)}>
                      · {planning.shift.duration_hours}h
                    </span>
                  )}
                </div>
              </div>

              {/* Lock badge */}
              {isLocked && (
                <Badge variant="warning" size="sm">
                  <Lock className="h-3 w-3" /> Verrouillé
                </Badge>
              )}
            </div>

            {/* Team */}
            {planning.team && (
              <div className="mt-3 flex items-center gap-2 border-t border-current/10 pt-3">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: planning.team.color || '#6172f3' }}
                />
                <span className={cn('text-xs font-medium', shiftColor?.text)}>
                  {planning.team.name}
                </span>
              </div>
            )}
          </div>

          {/* ── Assigned employee ────────────────────────── */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider
                            text-slate-400">
                Employé assigné
              </p>
              {/* Add employee button → opens suggestions */}
              {!isLocked && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<UserPlus className="h-3.5 w-3.5" />}
                  onClick={() => setShowSuggestions((s) => !s)}
                  className="text-brand-500 dark:text-brand-400"
                >
                  Ajouter
                </Button>
              )}
            </div>

            {planning.user ? (
              <div className="flex items-center gap-3 rounded-xl border
                              border-surface-100 p-3 dark:border-dark-600">
                <Avatar
                  src={planning.user.avatar_url}
                  name={planning.user.name}
                  size="md"
                  ring
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {planning.user.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-surface-300
                              p-4 text-center dark:border-dark-500">
                <Users className="mx-auto mb-1.5 h-5 w-5 text-slate-300" />
                <p className="text-xs text-slate-400">
                  Aucun employé assigné
                </p>
              </div>
            )}
          </div>

          {/* ── Smart suggestions panel ───────────────────── */}
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-3 flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider
                              text-slate-400">
                  Suggestions intelligentes
                </p>
                <Badge variant="primary" size="sm">IA</Badge>
              </div>
              <SmartSuggestionList
                shiftId={planning.shift_id}
                date={planning.date}
                teamId={planning.team_id}
                onSelect={handleSelectSuggestion}
                assigningId={assigningId}
              />
            </motion.div>
          )}

          {/* ── Notes ────────────────────────────────────── */}
          {planning.notes && (
            <div className="rounded-xl bg-surface-50 px-4 py-3
                            dark:bg-dark-600">
              <p className="mb-1 text-2xs font-semibold uppercase
                            tracking-wider text-slate-400">
                Notes
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {planning.notes}
              </p>
            </div>
          )}

          {/* ── Pause layer ───────────────────────────────── */}
          <PauseLayer
            planningId={planning.id}
            planning={planning}
            isLocked={isLocked}
          />

          {/* ── Creator info ──────────────────────────────── */}
          {planning.creator && (
            <div className="flex items-center gap-2 text-2xs text-slate-400">
              <Calendar className="h-3 w-3" />
              <span>
                Créé par {planning.creator.name}
                {' · '}
                Semaine {planning.week_number}/{planning.year}
              </span>
            </div>
          )}
        </div>
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Supprimer l'assignation"
        description={`Supprimer l'assignation de ${planning.user?.name || 'cet employé'} pour le ${formatDate(planning.date)} ? Cette action est irréversible.`}
      />
    </>
  )
}

export default PlanningDrawer