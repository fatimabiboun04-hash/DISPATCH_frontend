import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector }          from 'react-redux'
import { motion }                            from 'framer-motion'
import { Plus, Filter }                      from 'lucide-react'
import toast                                 from 'react-hot-toast'
import {
  fetchTasksThunk,
  createTaskThunk,
  updateTaskThunk,
  deleteTaskThunk,
} from '../../features/tasks/taskThunks'
import {
  selectTasks,
  selectTasksLoading,
  selectTasksError,
  selectTasksSubmitting,
} from '../../features/tasks/taskSelectors'
import { Button, ConfirmDialog, Select, ErrorState } from '../../components/ui'
import TaskFormModal from '../../components/tasks/TaskFormModal'

const PRIORITY_COLORS = {
  low:      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  medium:   'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  high:     'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  critical: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
}

const STATUS_COLORS = {
  pending:     'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
  in_progress: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  completed:   'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  cancelled:   'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
}

const TasksPage = () => {
  const dispatch   = useDispatch()
  const tasks      = useSelector(selectTasks)
  const loading    = useSelector(selectTasksLoading)
  const error      = useSelector(selectTasksError)
  const submitting = useSelector(selectTasksSubmitting)

  const [formOpen,  setFormOpen]  = useState(false)
  const [editTask,  setEditTask]  = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  const fetchTasks = useCallback(() => {
    const params = {}
    if (filterStatus) params.status = filterStatus
    if (filterPriority) params.priority = filterPriority
    dispatch(fetchTasksThunk(params))
  }, [dispatch, filterStatus, filterPriority])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleCreate = () => {
    setEditTask(null)
    setFormOpen(true)
  }

  const handleEdit = (task) => {
    setEditTask(task)
    setFormOpen(true)
  }

  const handleStatusChange = async (task, newStatus) => {
    const result = await dispatch(updateTaskThunk({
      id: task.id,
      data: { status: newStatus },
    }))
    if (updateTaskThunk.fulfilled.match(result)) {
      toast.success('Statut mis à jour')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const result = await dispatch(deleteTaskThunk(deleteTarget.id))
    if (deleteTaskThunk.fulfilled.match(result)) {
      toast.success('Tâche supprimée')
      setDeleteTarget(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Tâches
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">
            {tasks.length} tâche{tasks.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={handleCreate}
          >
            Nouvelle tâche
          </Button>
        </div>
      </motion.div>

      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-slate-400" />
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-40"
        >
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="in_progress">En cours</option>
          <option value="completed">Terminé</option>
          <option value="cancelled">Annulé</option>
        </Select>
        <Select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="w-40"
        >
          <option value="">Toutes priorités</option>
          <option value="low">Basse</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
          <option value="critical">Critique</option>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTasks} />
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-12 dark:border-slate-700">
          <p className="text-sm text-slate-400">Aucune tâche trouvée</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={handleCreate}>
            Créer une tâche
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-dark-600">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Titre</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Employé</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Statut</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Priorité</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Échéance</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-dark-600">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleEdit(task)}
                      className="font-medium text-slate-800 hover:text-brand-600 dark:text-slate-200"
                    >
                      {task.title}
                    </button>
                    {task.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                        {task.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {task.user?.name || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                      className={`rounded-md border-0 px-2 py-1 text-xs font-medium ${STATUS_COLORS[task.status] || ''}`}
                    >
                      <option value="pending">En attente</option>
                      <option value="in_progress">En cours</option>
                      <option value="completed">Terminé</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-md px-2 py-1 text-xs font-medium ${PRIORITY_COLORS[task.priority] || ''}`}>
                      {task.priority === 'low' && 'Basse'}
                      {task.priority === 'medium' && 'Moyenne'}
                      {task.priority === 'high' && 'Haute'}
                      {task.priority === 'critical' && 'Critique'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                    {task.due_date || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteTarget(task)}
                    >
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TaskFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTask(null) }}
        task={editTask}
        onSuccess={() => fetchTasks()}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={submitting}
        variant="danger"
        title="Supprimer la tâche"
        description={`Supprimer définitivement "${deleteTarget?.title}" ?`}
        confirmLabel="Supprimer"
      />
    </div>
  )
}

export default TasksPage
