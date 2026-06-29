import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  Coffee, RefreshCw, Clock, Hourglass, Activity,
  ChevronRight, CalendarDays, Plus, Edit3,
  XCircle, CheckCircle, Trash2,
} from 'lucide-react'
import {
  fetchPausesListThunk,
  fetchPauseStatsThunk,
  deletePauseThunk,
  cancelPauseThunk,
  completePauseThunk,
  createPauseThunk,
  updatePauseThunk,
} from '../../features/pauses/pauseThunks'
import {
  StatCard, Card, Table, Badge, FilterBar, SearchInput,
  Select, Button, Drawer, Avatar, Modal, ConfirmDialog,
} from '../../components/ui'

const formatMinutes = (mins) => {
  if (!mins && mins !== 0) return '-'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0) return `${h}h ${m}min`
  return `${m} min`
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-'
const formatDateTime = (d) => d ? new Date(d).toLocaleString('fr-FR') : '-'

const STATUS_CONFIG = {
  scheduled: { label: 'Planifiée', variant: 'info' },
  active:    { label: 'En cours', variant: 'success' },
  completed: { label: 'Terminée', variant: 'default' },
  cancelled: { label: 'Annulée', variant: 'warning' },
  expired:   { label: 'Expirée', variant: 'error' },
}

const TYPE_CONFIG = {
  break:     { label: 'Pause', icon: Coffee },
  lunch:     { label: 'Déjeuner', icon: Coffee },
  medical:   { label: 'Médicale', icon: Activity },
  technical: { label: 'Technique', icon: Activity },
  training:  { label: 'Formation', icon: Activity },
  other:     { label: 'Autre', icon: Activity },
}

const emptyPauseForm = {
  planning_id: '',
  user_id: '',
  pause_start: '',
  pause_end: '',
  type: 'break',
  reason: '',
  duration_minutes: '',
}

const PauseManagementPage = () => {
  const dispatch = useDispatch()
  const {
    list, listLoading, stats, statsLoading,
    submitting, submitError,
  } = useSelector((state) => state.pauses)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [selectedPause, setSelectedPause] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editPause, setEditPause] = useState(null)
  const [form, setForm] = useState(emptyPauseForm)
  const [formErrors, setFormErrors] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [completeTarget, setCompleteTarget] = useState(null)

  const fetchData = useCallback(() => {
    const params = { page, per_page: 20 }
    if (search) params.search = search
    if (statusFilter) params.status = statusFilter
    if (typeFilter) params.type = typeFilter
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    dispatch(fetchPausesListThunk(params))
    dispatch(fetchPauseStatsThunk())
  }, [dispatch, page, search, statusFilter, typeFilter, dateFrom, dateTo])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => { setPage(1) }, [search, statusFilter, typeFilter, dateFrom, dateTo])

  const openCreateModal = () => {
    setEditPause(null)
    setForm(emptyPauseForm)
    setFormErrors({})
    setModalOpen(true)
  }

  const openEditModal = (pause, e) => {
    e?.stopPropagation()
    setEditPause(pause)
    setForm({
      planning_id: pause.planning_id || '',
      user_id: pause.user_id || '',
      pause_start: pause.pause_start?.substring(0, 5) || '',
      pause_end: pause.pause_end?.substring(0, 5) || '',
      type: pause.type || 'break',
      reason: pause.reason || '',
      duration_minutes: pause.duration_minutes || '',
    })
    setFormErrors({})
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!form.planning_id) errors.planning_id = 'Planning requis'
    if (!form.user_id) errors.user_id = 'Employé requis'
    if (!form.pause_start) errors.pause_start = 'Début requis'
    if (!form.pause_end) errors.pause_end = 'Fin requise'
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    if (editPause) {
      await dispatch(updatePauseThunk({ pauseId: editPause.id, planningId: editPause.planning_id, data: form }))
    } else {
      await dispatch(createPauseThunk({ planningId: form.planning_id, data: form }))
    }

    setModalOpen(false)
    fetchData()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await dispatch(deletePauseThunk({ pauseId: deleteTarget.id, planningId: deleteTarget.planning_id }))
    setDeleteTarget(null)
    fetchData()
  }

  const handleCancel = async () => {
    if (!cancelTarget) return
    await dispatch(cancelPauseThunk({ pauseId: cancelTarget.id, planningId: cancelTarget.planning_id }))
    setCancelTarget(null)
    fetchData()
  }

  const handleComplete = async () => {
    if (!completeTarget) return
    await dispatch(completePauseThunk({ pauseId: completeTarget.id, planningId: completeTarget.planning_id }))
    setCompleteTarget(null)
    fetchData()
  }

  const pauses = list?.data || []
  const meta = list || {}

  const columns = [
    {
      key: 'user',
      label: 'Employé',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.user?.name} size="sm" />
          <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {row.user?.name || '-'}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      width: 100,
      render: (row) => {
        const tc = TYPE_CONFIG[row.type] || TYPE_CONFIG.other
        return (
          <Badge variant="default" size="sm">
            {tc.label}
          </Badge>
        )
      },
    },
    {
      key: 'planning_date',
      label: 'Date',
      width: 110,
      render: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {formatDate(row.planning?.date)}
        </span>
      ),
    },
    {
      key: 'pause_start',
      label: 'Début',
      width: 80,
      render: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">{row.pause_start}</span>
      ),
    },
    {
      key: 'pause_end',
      label: 'Fin',
      width: 80,
      render: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">{row.pause_end}</span>
      ),
    },
    {
      key: 'duration_minutes',
      label: 'Durée',
      width: 80,
      render: (row) => (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {formatMinutes(row.duration_minutes)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      width: 110,
      render: (row) => {
        const sc = STATUS_CONFIG[row.status] || STATUS_CONFIG.completed
        return <Badge variant={sc.variant} size="sm">{sc.label}</Badge>
      },
    },
    {
      key: 'actions',
      label: '',
      width: 120,
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.isEditable && (
            <button
              onClick={(e) => openEditModal(row, e)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-surface-100 hover:text-blue-500 dark:hover:bg-dark-600"
              title="Modifier"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
          )}
          {row.isCancellable && (
            <button
              onClick={(e) => { e.stopPropagation(); setCancelTarget(row) }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-surface-100 hover:text-amber-500 dark:hover:bg-dark-600"
              title="Annuler"
            >
              <XCircle className="h-3.5 w-3.5" />
            </button>
          )}
          {row.status === 'active' && (
            <button
              onClick={(e) => { e.stopPropagation(); setCompleteTarget(row) }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-surface-100 hover:text-green-500 dark:hover:bg-dark-600"
              title="Terminer"
            >
              <CheckCircle className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(row) }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-surface-100 hover:text-red-500 dark:hover:bg-dark-600"
            title="Supprimer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Gestion des Pauses
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">
            {meta.total ? `${meta.total} pause(s) au total` : 'Suivi des pauses employés'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Nouvelle pause
          </Button>
          <Button variant="secondary" size="sm" onClick={fetchData} loading={listLoading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Coffee}
          label="Total Pauses"
          value={statsLoading ? '\u2026' : stats?.total_pauses ?? '\u2026'}
        />
        <StatCard
          icon={Clock}
          label="Durée moyenne"
          value={statsLoading ? '\u2026' : formatMinutes(stats?.avg_duration_minutes)}
        />
        <StatCard
          icon={Hourglass}
          label="Plus longue"
          value={statsLoading ? '\u2026' : formatMinutes(stats?.longest_pause?.duration_minutes)}
          sub={stats?.longest_pause?.user_name || ''}
        />
        <StatCard
          icon={Activity}
          label="En cours"
          value={statsLoading ? '\u2026' : stats?.currently_active ?? '\u2026'}
        />
      </div>

      {/* Filters */}
      <FilterBar>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Rechercher un employé..."
          size="sm"
          className="min-w-[200px]"
        />
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { value: '', label: 'Tous les types' },
            { value: 'break', label: 'Pause' },
            { value: 'lunch', label: 'Déjeuner' },
            { value: 'medical', label: 'Médicale' },
            { value: 'technical', label: 'Technique' },
            { value: 'training', label: 'Formation' },
            { value: 'other', label: 'Autre' },
          ]}
          size="sm"
          containerClassName="min-w-[140px]"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'Tous les statuts' },
            { value: 'scheduled', label: 'Planifiée' },
            { value: 'active', label: 'En cours' },
            { value: 'completed', label: 'Terminée' },
            { value: 'cancelled', label: 'Annulée' },
            { value: 'expired', label: 'Expirée' },
          ]}
          size="sm"
          containerClassName="min-w-[150px]"
        />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="h-8 rounded-lg border border-surface-200 bg-surface-50 px-3 text-xs text-slate-600 dark:border-dark-500 dark:bg-dark-700 dark:text-slate-300"
          placeholder="Du"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="h-8 rounded-lg border border-surface-200 bg-surface-50 px-3 text-xs text-slate-600 dark:border-dark-500 dark:bg-dark-700 dark:text-slate-300"
          placeholder="Au"
        />
      </FilterBar>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <Table
          columns={columns}
          data={pauses}
          keyField="id"
          loading={listLoading}
          onRowClick={(row) => setSelectedPause(row)}
          currentPage={meta.current_page}
          lastPage={meta.last_page}
          total={meta.total}
          perPage={meta.per_page}
          onPageChange={setPage}
          emptyIcon={Coffee}
          emptyTitle="Aucune pause"
          emptyDesc="Aucune pause ne correspond à vos critères."
        />
      </Card>

      {/* Detail Drawer */}
      <Drawer
        open={!!selectedPause}
        onClose={() => setSelectedPause(null)}
        title="Détail de la pause"
        subtitle={selectedPause?.user?.name ? `Employé: ${selectedPause.user.name}` : ''}
        size="sm"
      >
        {selectedPause && (
          <div className="space-y-6">
            {/* Employee */}
            <div className="flex items-center gap-3 rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-dark-500 dark:bg-dark-700">
              <Avatar name={selectedPause.user?.name} size="md" />
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {selectedPause.user?.name || '-'}
                </p>
                <p className="text-xs text-slate-400">{selectedPause.user?.email}</p>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Date</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                  {formatDate(selectedPause.planning?.date)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Shift</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                  {selectedPause.planning?.shift?.name || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Type</p>
                <p className="mt-1">
                  <Badge variant="default" size="sm">
                    {TYPE_CONFIG[selectedPause.type]?.label || selectedPause.type}
                  </Badge>
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Statut</p>
                <p className="mt-1">
                  <Badge variant={STATUS_CONFIG[selectedPause.status]?.variant || 'default'} size="sm">
                    {STATUS_CONFIG[selectedPause.status]?.label || selectedPause.status}
                  </Badge>
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Début</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                  {selectedPause.pause_start}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Fin</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                  {selectedPause.pause_end}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Durée</p>
                <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {formatMinutes(selectedPause.duration_minutes)}
                </p>
              </div>
            </div>

            {/* Reason */}
            {selectedPause.reason && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Motif</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 bg-surface-50 dark:bg-dark-600 rounded-lg p-3">
                  {selectedPause.reason}
                </p>
              </div>
            )}

            {/* Cancellation info */}
            {selectedPause.status === 'cancelled' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                  Annulation
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {selectedPause.canceller?.name
                    ? `Annulé par ${selectedPause.canceller.name}`
                    : 'Annulé'}{selectedPause.cancelled_at ? ` le ${formatDateTime(selectedPause.cancelled_at)}` : ''}
                </p>
              </div>
            )}

            {/* Team */}
            {selectedPause.team && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Équipe</p>
                <Badge variant="info" size="sm">{selectedPause.team.name}</Badge>
              </div>
            )}

            {/* Creator */}
            {selectedPause.creator && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Créé par</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {selectedPause.creator.name}
                </p>
              </div>
            )}

            {/* Timestamps */}
            <div className="rounded-xl border border-surface-200 bg-surface-50 p-3 dark:border-dark-500 dark:bg-dark-700">
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div>
                  <span className="font-medium">Créé le:</span>{' '}
                  {formatDateTime(selectedPause.created_at)}
                </div>
                <div>
                  <span className="font-medium">Modifié le:</span>{' '}
                  {formatDateTime(selectedPause.updated_at)}
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editPause ? 'Modifier la pause' : 'Nouvelle pause'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
              Annuler
            </Button>
            <Button variant="primary" loading={submitting} onClick={handleSubmit}>
              {editPause ? 'Enregistrer' : 'Créer'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Planning ID
            </label>
            <input
              type="number"
              value={form.planning_id}
              onChange={(e) => setForm({ ...form, planning_id: e.target.value })}
              className="h-9 w-full rounded-lg border border-surface-200 bg-surface-50 px-3 text-sm text-slate-700 dark:border-dark-500 dark:bg-dark-700 dark:text-slate-200"
              placeholder="ID du planning"
            />
            {formErrors.planning_id && <p className="mt-1 text-xs text-red-500">{formErrors.planning_id}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Employé ID
            </label>
            <input
              type="number"
              value={form.user_id}
              onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              className="h-9 w-full rounded-lg border border-surface-200 bg-surface-50 px-3 text-sm text-slate-700 dark:border-dark-500 dark:bg-dark-700 dark:text-slate-200"
              placeholder="ID de l'employé"
            />
            {formErrors.user_id && <p className="mt-1 text-xs text-red-500">{formErrors.user_id}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Début</label>
              <input
                type="time"
                value={form.pause_start}
                onChange={(e) => setForm({ ...form, pause_start: e.target.value })}
                className="h-9 w-full rounded-lg border border-surface-200 bg-surface-50 px-3 text-sm text-slate-700 dark:border-dark-500 dark:bg-dark-700 dark:text-slate-200"
              />
              {formErrors.pause_start && <p className="mt-1 text-xs text-red-500">{formErrors.pause_start}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Fin</label>
              <input
                type="time"
                value={form.pause_end}
                onChange={(e) => setForm({ ...form, pause_end: e.target.value })}
                className="h-9 w-full rounded-lg border border-surface-200 bg-surface-50 px-3 text-sm text-slate-700 dark:border-dark-500 dark:bg-dark-700 dark:text-slate-200"
              />
              {formErrors.pause_end && <p className="mt-1 text-xs text-red-500">{formErrors.pause_end}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Type</label>
              <Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                options={[
                  { value: 'break', label: 'Pause' },
                  { value: 'lunch', label: 'Déjeuner' },
                  { value: 'medical', label: 'Médicale' },
                  { value: 'technical', label: 'Technique' },
                  { value: 'training', label: 'Formation' },
                  { value: 'other', label: 'Autre' },
                ]}
                size="sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Durée (minutes)
              </label>
              <input
                type="number"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                className="h-9 w-full rounded-lg border border-surface-200 bg-surface-50 px-3 text-sm text-slate-700 dark:border-dark-500 dark:bg-dark-700 dark:text-slate-200"
                placeholder="Optionnel"
                min="1"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Motif</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="h-20 w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-slate-700 dark:border-dark-500 dark:bg-dark-700 dark:text-slate-200"
              placeholder="Optionnel"
              maxLength={500}
            />
          </div>
          {submitError && (
            <p className="text-sm text-red-500">{submitError}</p>
          )}
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={submitting}
        title="Supprimer la pause ?"
        description={`Voulez-vous vraiment supprimer la pause de ${deleteTarget?.user?.name || 'cet employé'} ? Cette action est irréversible.`}
      />

      {/* Cancel confirmation */}
      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        loading={submitting}
        title="Annuler la pause ?"
        description={`La pause de ${cancelTarget?.user?.name || 'cet employé'} sera marquée comme annulée.`}
        confirmLabel="Annuler la pause"
        variant="warning"
      />

      {/* Complete confirmation */}
      <ConfirmDialog
        open={!!completeTarget}
        onClose={() => setCompleteTarget(null)}
        onConfirm={handleComplete}
        loading={submitting}
        title="Terminer la pause ?"
        description={`La pause de ${completeTarget?.user?.name || 'cet employé'} sera terminée immédiatement.`}
        confirmLabel="Terminer"
        variant="warning"
      />
    </div>
  )
}

export default PauseManagementPage
