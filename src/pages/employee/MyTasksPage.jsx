import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion }                   from 'framer-motion'
import toast                        from 'react-hot-toast'
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'
import {
  fetchMyTasksThunk,
  updateTaskThunk,
} from '../../features/tasks/taskThunks'
import {
  selectMyTasks,
  selectTasksLoading,
  selectTasksError,
} from '../../features/tasks/taskSelectors'

const STATUS_ICONS = {
  pending:     Clock,
  in_progress: AlertCircle,
  completed:   CheckCircle,
  cancelled:   XCircle,
}

const STATUS_LABELS = {
  pending:     'En attente',
  in_progress: 'En cours',
  completed:   'Terminé',
  cancelled:   'Annulé',
}

const PRIORITY_LABELS = {
  low:      'Basse',
  medium:   'Moyenne',
  high:     'Haute',
  critical: 'Critique',
}

const MyTasksPage = () => {
  const dispatch = useDispatch()
  const tasks    = useSelector(selectMyTasks)
  const loading  = useSelector(selectTasksLoading)
  const error    = useSelector(selectTasksError)

  const fetchTasks = useCallback(() => {
    dispatch(fetchMyTasksThunk())
  }, [dispatch])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleStatusChange = async (task, newStatus) => {
    const result = await dispatch(updateTaskThunk({
      id: task.id,
      data: { status: newStatus },
    }))
    if (updateTaskThunk.fulfilled.match(result)) {
      toast.success('Statut mis à jour')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Mes Tâches
        </h1>
        <p className="mt-0.5 text-sm text-slate-400">
          {tasks.length} tâche{tasks.length !== 1 ? 's' : ''} assignée{tasks.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-12 dark:border-slate-700">
          <CheckCircle className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-400">Aucune tâche pour le moment</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => {
            const StatusIcon = STATUS_ICONS[task.status] || Clock
            return (
              <div
                key={task.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-dark-600"
              >
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="font-medium text-slate-800 dark:text-slate-200">
                    {task.title}
                  </h3>
                  <span className={`ml-2 shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${
                    task.priority === 'critical' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                    task.priority === 'high' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' :
                    task.priority === 'medium' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {PRIORITY_LABELS[task.priority]}
                  </span>
                </div>

                {task.description && (
                  <p className="mb-3 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="mb-3 flex items-center gap-2">
                  <StatusIcon className={`h-4 w-4 ${
                    task.status === 'completed' ? 'text-green-500' :
                    task.status === 'in_progress' ? 'text-blue-500' :
                    task.status === 'cancelled' ? 'text-slate-400' :
                    'text-yellow-500'
                  }`} />
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value)}
                    className="text-sm font-medium text-slate-600 dark:text-slate-300 bg-transparent border-0 cursor-pointer"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {task.due_date && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>Échéance : {task.due_date}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MyTasksPage
