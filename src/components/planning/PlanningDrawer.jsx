import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  Calendar, Clock, Users, Lock, Unlock,
  Trash2, UserPlus, Award, Edit3, X,
  Copy, Save,
} from 'lucide-react'
import { fetchPausesByPlanningThunk } from '../../features/pauses/pauseThunks'
import {
  deletePlanningThunk,
  createPlanningThunk,
  updatePlanningThunk,
  lockPlanningThunk,
  overrideLockThunk,
} from '../../features/planning/planningThunks'
import {
  selectPlanningSubmitting,
} from '../../features/planning/planningSelectors'
import { selectActiveShifts } from '../../features/shifts/shiftSelectors'
import { selectTeamList } from '../../features/teams/teamSelectors'
import SmartSuggestionList from './SmartSuggestionList'
import PauseLayer          from './PauseLayer'
import HoursDetail         from './HoursDetail'
import ShiftSelect         from './ShiftSelect'
import { Drawer, Avatar, Badge, Button,
         ConfirmDialog, Tooltip, SkillBadge } from '../ui'
import { getShiftColor }   from '../../constants/shiftColors'
import { formatDate }      from '../../utils/formatters'
import { cn }              from '../../utils/cn'
import toast               from 'react-hot-toast'

const PlanningDrawer = ({
  open,
  onClose,
  planning,
  onDeleted,
  onRefresh,
}) => {
  const dispatch        = useDispatch()
  const submitting      = useSelector(selectPlanningSubmitting)
  const activeShifts    = useSelector(selectActiveShifts)
  const teams           = useSelector(selectTeamList)
  const dupDateRef      = useRef(null)

  const [showSuggestions, setShowSuggestions] = useState(false)
  const [assigningId,     setAssigningId]     = useState(null)
  const [deleteOpen,      setDeleteOpen]      = useState(false)
  const [deleting,        setDeleting]        = useState(false)
  const [overriding,      setOverriding]      = useState(false)
  const [locking,         setLocking]         = useState(false)
  const [editing,         setEditing]         = useState(false)
  const [saving,          setSaving]          = useState(false)

  // Duplicate state
  const [dupOpen,    setDupOpen]    = useState(false)
  const [dupDate,    setDupDate]    = useState('')
  const [dupLoading, setDupLoading] = useState(false)

  // Copy prev state
  const [copyLoading, setCopyLoading] = useState(false)

  // Edit state
  const [editShiftId, setEditShiftId] = useState(null)
  const [editTeamId,  setEditTeamId]  = useState(null)
  const [editNotes,   setEditNotes]   = useState('')

  const shiftColor = planning ? getShiftColor(planning.shift?.type) : null

  useEffect(() => {
    if (open && planning?.id) {
      dispatch(fetchPausesByPlanningThunk(planning.id))
    }
    setShowSuggestions(false)
    setEditing(false)
    if (planning) {
      setEditShiftId(planning.shift_id)
      setEditTeamId(planning.team_id || null)
      setEditNotes(planning.notes || '')
    }
  }, [open, planning?.id, dispatch, planning?.shift_id, planning?.team_id, planning?.notes])

  if (!planning) return null

  const isLocked = planning.is_locked

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

  const handleSaveEdit = async () => {
    setSaving(true)
    const result = await dispatch(updatePlanningThunk({
      id: planning.id,
      data: {
        user_id:  planning.user_id,
        shift_id: editShiftId,
        team_id:  editTeamId || undefined,
        date:     planning.date,
        notes:    editNotes || undefined,
      },
    }))
    setSaving(false)
    if (updatePlanningThunk.fulfilled.match(result)) {
      toast.success('Assignation modifiée')
      setEditing(false)
      onRefresh?.()
    } else {
      toast.error('Erreur lors de la modification')
    }
  }

  const handleDuplicate = async () => {
    if (!dupDate) return
    setDupLoading(true)
    const result = await dispatch(createPlanningThunk({
      user_id:  planning.user_id,
      shift_id: planning.shift_id,
      date:     dupDate,
      team_id:  planning.team_id || undefined,
      notes:    planning.notes || undefined,
    }))
    setDupLoading(false)
    if (createPlanningThunk.fulfilled.match(result)) {
      toast.success(`Assignation dupliquée vers ${formatDate(dupDate)}`)
      setDupOpen(false)
      setDupDate('')
      onRefresh?.()
    }
  }

  const handleCopyPrevDay = async () => {
    const prevDate = new Date(planning.date)
    prevDate.setDate(prevDate.getDate() - 1)
    const prevDateStr = prevDate.toISOString().split('T')[0]
    setCopyLoading(true)
    const result = await dispatch(createPlanningThunk({
      user_id:  planning.user_id,
      shift_id: planning.shift_id,
      date:     prevDateStr,
      team_id:  planning.team_id || undefined,
    }))
    setCopyLoading(false)
    if (createPlanningThunk.fulfilled.match(result)) {
      toast.success('Assignation copiée au jour précédent')
      onRefresh?.()
    }
  }

  const defaultDupDate = planning.date
    ? (() => {
        const d = new Date(planning.date)
        d.setDate(d.getDate() + 1)
        return d.toISOString().split('T')[0]
      })()
    : ''

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        size="md"
        title={
          <div className="flex items-center gap-2">
            <span>{formatDate(planning.date, 'EEEE d MMMM yyyy')}</span>
            {isLocked && <Lock className="h-3.5 w-3.5 text-amber-500" />}
          </div>
        }
        subtitle={`Semaine ${planning.week_number}`}
        footer={
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isLocked ? (
                <Tooltip content="Débloquer cette assignation">
                  <Button
                    variant="secondary" size="sm"
                    leftIcon={<Unlock className="h-3.5 w-3.5" />}
                    loading={overriding} onClick={handleOverrideLock}
                  >
                    Débloquer
                  </Button>
                </Tooltip>
              ) : (
                <>
                  <Tooltip content="Verrouiller">
                    <Button
                      variant="secondary" size="sm"
                      leftIcon={<Lock className="h-3.5 w-3.5" />}
                      loading={locking} onClick={handleLockPlanning}
                    />
                  </Tooltip>
                  <Tooltip content="Modifier">
                    <Button
                      variant="secondary" size="sm"
                      leftIcon={editing ? <X className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
                      onClick={() => { if (editing) { setEditShiftId(planning.shift_id); setEditTeamId(planning.team_id || null); setEditNotes(planning.notes || '') }; setEditing((e) => !e) }}
                    />
                  </Tooltip>
                  <Tooltip content="Dupliquer">
                    <Button
                      variant="secondary" size="sm"
                      leftIcon={<Copy className="h-3.5 w-3.5" />}
                      onClick={() => { setDupDate(defaultDupDate); setDupOpen(true) }}
                    />
                  </Tooltip>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {editing && (
                <Button
                  variant="primary" size="sm"
                  leftIcon={<Save className="h-3.5 w-3.5" />}
                  loading={saving} onClick={handleSaveEdit}
                  disabled={!editShiftId}
                >
                  Enregistrer
                </Button>
              )}
              <Tooltip content={isLocked ? 'Déverrouillez d\'abord' : 'Supprimer'}>
                <Button
                  variant="danger" size="sm"
                  leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                  disabled={isLocked} onClick={() => setDeleteOpen(true)}
                />
              </Tooltip>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-5">

          {/* ── Shift section ─────────────────────────── */}
          <div className={cn(
            'rounded-xl border p-4',
            shiftColor?.bg, shiftColor?.border
          )}>
            {editing ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Shift
                </p>
                <ShiftSelect
                  shifts={activeShifts}
                  value={editShiftId}
                  onChange={setEditShiftId}
                />
                <div className="flex items-center gap-2">
                  <span className="text-2xs font-medium text-slate-400">Équipe</span>
                  <select
                    value={editTeamId || ''}
                    onChange={(e) => setEditTeamId(e.target.value ? Number(e.target.value) : null)}
                    className="flex-1 rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-xs dark:border-dark-400 dark:bg-dark-700"
                  >
                    <option value="">— Aucune —</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
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
                </div>

                {planning.shift?.skills?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-current/10 pt-3">
                    <Award className={cn('h-3.5 w-3.5 mr-0.5', shiftColor?.text)} />
                    {planning.shift.skills.map((skill) => (
                      <SkillBadge key={skill.id} name={skill.name} />
                    ))}
                  </div>
                )}

                {planning.team && (
                  <div className="mt-3 flex items-center gap-2 border-t border-current/10 pt-3">
                    <div
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: planning.team.color || '#6172f3' }}
                    />
                    <span className={cn('text-xs font-medium', shiftColor?.text)}>
                      {planning.team.name}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Employee section ──────────────────────── */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Employé assigné
              </p>
              {!isLocked && !editing && (
                <Button
                  variant="ghost" size="sm"
                  leftIcon={<UserPlus className="h-3.5 w-3.5" />}
                  onClick={() => setShowSuggestions((s) => !s)}
                  className="text-brand-500 dark:text-brand-400"
                >
                  Suggérer
                </Button>
              )}
            </div>

            {planning.user ? (
              <div className="flex items-center gap-3 rounded-xl border border-surface-100 p-3 dark:border-dark-600">
                <Avatar src={planning.user.avatar_url} name={planning.user.name} size="md" ring />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {planning.user.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-surface-300 p-4 text-center dark:border-dark-500">
                <Users className="mx-auto mb-1.5 h-5 w-5 text-slate-300" />
                <p className="text-xs text-slate-400">Aucun employé assigné</p>
              </div>
            )}
          </div>

          {/* ── Weekly hours ──────────────────────────── */}
          {planning.user && planning.shift?.duration_hours > 0 && (
            <HoursDetail
              assignmentHours={planning.shift.duration_hours}
              limit={44}
            />
          )}

          {/* ── Suggestions ────────────────────────────── */}
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-3 flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Suggestions
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

          {/* ── Notes ─────────────────────────────────── */}
          {editing ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Notes
              </p>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-xs dark:border-dark-400 dark:bg-dark-700"
                rows={3}
                placeholder="Ajouter des notes…"
              />
            </div>
          ) : planning.notes ? (
            <div className="rounded-xl bg-surface-50 px-4 py-3 dark:bg-dark-600">
              <p className="mb-1 text-2xs font-semibold uppercase tracking-wider text-slate-400">
                Notes
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {planning.notes}
              </p>
            </div>
          ) : null}

          {/* ── Actions row ───────────────────────────── */}
          {!editing && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline" size="sm"
                leftIcon={<Copy className="h-3.5 w-3.5" />}
                loading={copyLoading}
                onClick={handleCopyPrevDay}
                disabled={isLocked}
              >
                Copier au jour précédent
              </Button>
              <Button
                variant="outline" size="sm"
                leftIcon={<Copy className="h-3.5 w-3.5" />}
                onClick={() => { setDupDate(defaultDupDate); setDupOpen(true) }}
                disabled={isLocked}
              >
                Dupliquer
              </Button>
            </div>
          )}

          {/* ── Duplicate inline form ──────────────────── */}
          {dupOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-xl border border-surface-200 bg-surface-50 p-3 space-y-2 dark:border-dark-500 dark:bg-dark-600"
            >
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Dupliquer vers
              </p>
              <div className="flex items-center gap-2">
                <input
                  ref={dupDateRef}
                  type="date"
                  value={dupDate}
                  onChange={(e) => setDupDate(e.target.value)}
                  className="flex-1 rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-xs dark:border-dark-400 dark:bg-dark-700"
                />
                <Button
                  size="sm"
                  variant="primary"
                  loading={dupLoading}
                  onClick={handleDuplicate}
                  disabled={!dupDate}
                >
                  Dupliquer
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setDupOpen(false); setDupDate('') }}
                >
                  Annuler
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Pauses ────────────────────────────────── */}
          <PauseLayer
            planningId={planning.id}
            planning={planning}
            isLocked={isLocked}
          />

          {/* ── Creator info ──────────────────────────── */}
          {planning.creator && (
            <div className="flex items-center gap-2 text-2xs text-slate-400">
              <Calendar className="h-3 w-3" />
              <span>
                Créé par {planning.creator.name}
                {' · '}Semaine {planning.week_number}/{planning.year}
              </span>
            </div>
          )}
        </div>
      </Drawer>

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
