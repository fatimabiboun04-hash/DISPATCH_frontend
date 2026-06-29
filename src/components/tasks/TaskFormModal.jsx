import { useEffect, useState } from 'react'
import { useForm }              from 'react-hook-form'
import { z }                    from 'zod'
import { zodResolver }          from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { createTaskThunk, updateTaskThunk } from '../../features/tasks/taskThunks'
import {
  selectTasksSubmitting,
  selectTasksSubmitError,
} from '../../features/tasks/taskSelectors'
import { clearSubmitError } from '../../features/tasks/taskSlice'
import { Modal, Input, Select, Button, TextArea } from '../ui'
import toast                from 'react-hot-toast'
import axiosInstance        from '../../services/axiosInstance'
import { API }              from '../../constants/apiRoutes'

const schema = z.object({
  user_id:  z.string().min(1, 'Employé requis'),
  planning_id: z.string().min(1, 'Planning requis'),
  title:    z.string().min(1, 'Le titre est requis').max(255),
  description: z.string().optional(),
  status:   z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  due_date: z.string().optional(),
})

const PRIORITY_OPTIONS = [
  { value: 'low',      label: 'Basse'    },
  { value: 'medium',   label: 'Moyenne'  },
  { value: 'high',     label: 'Haute'    },
  { value: 'critical', label: 'Critique' },
]

const STATUS_OPTIONS = [
  { value: 'pending',     label: 'En attente' },
  { value: 'in_progress', label: 'En cours'   },
  { value: 'completed',   label: 'Terminé'    },
  { value: 'cancelled',   label: 'Annulé'     },
]

const TaskFormModal = ({
  open,
  onClose,
  task    = null,
  onSuccess,
}) => {
  const dispatch    = useDispatch()
  const submitting  = useSelector(selectTasksSubmitting)
  const submitError = useSelector(selectTasksSubmitError)
  const isEdit      = !!task

  const [employees, setEmployees] = useState([])
  const [planningOptions, setPlanningOptions] = useState([])
  const [planningLoading, setPlanningLoading] = useState(false)

  useEffect(() => {
    if (open) {
      dispatch(clearSubmitError())
      axiosInstance.get(API.EMPLOYEES.LIST).then((res) => {
        setEmployees(res.data.data || [])
      }).catch(() => {})
    }
  }, [open, dispatch])

  const selectedUserId = watch('user_id')

  useEffect(() => {
    if (!selectedUserId) {
      setPlanningOptions([])
      return
    }
    setPlanningLoading(true)
    axiosInstance.get(API.PLANNING.LIST, {
      params: { user_id: selectedUserId, per_page: 20 },
    }).then((res) => {
      const data = res.data?.data || []
      setPlanningOptions(data.map((p) => ({
        value: String(p.id),
        label: `${p.date} — ${p.shift?.name || ''}`,
      })))
    }).catch(() => {}).finally(() => setPlanningLoading(false))
  }, [selectedUserId])

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      user_id:     '',
      planning_id: '',
      title:       '',
      description: '',
      status:      'pending',
      priority:    'medium',
      due_date:    '',
    },
  })

  useEffect(() => {
    if (open) {
      if (isEdit) {
        reset({
          user_id:     String(task.user_id || ''),
          planning_id: String(task.planning_id || ''),
          title:       task.title || '',
          description: task.description || '',
          status:      task.status || 'pending',
          priority:    task.priority || 'medium',
          due_date:    task.due_date || '',
        })
      } else {
        reset({
          user_id:     '',
          planning_id: '',
          title:       '',
          description: '',
          status:      'pending',
          priority:    'medium',
          due_date:    '',
        })
      }
    }
  }, [open, isEdit, task, reset])

  const onSubmit = async (formData) => {
    const payload = {
      user_id:     Number(formData.user_id),
      planning_id: Number(formData.planning_id),
      title:       formData.title,
      description: formData.description || null,
      status:      formData.status || 'pending',
      priority:    formData.priority || 'medium',
      due_date:    formData.due_date || null,
    }

    const action = isEdit
      ? updateTaskThunk({ id: task.id, data: payload })
      : createTaskThunk(payload)

    const result = await dispatch(action)

    const fulfilled = isEdit
      ? updateTaskThunk.fulfilled.match(result)
      : createTaskThunk.fulfilled.match(result)

    if (fulfilled) {
      toast.success(isEdit ? 'Tâche mise à jour' : 'Tâche créée')
      onSuccess?.(result.payload)
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifier la tâche' : 'Nouvelle tâche'}
      subtitle={isEdit ? task.title : 'Assignez une tâche à un employé'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button
            loading={submitting}
            onClick={handleSubmit(onSubmit)}
          >
            {isEdit ? 'Enregistrer' : 'Créer la tâche'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">

        {submitError && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {submitError}
          </div>
        )}

        <Select
          label="Employé"
          required
          placeholder="Sélectionner un employé"
          options={employees.map((emp) => ({
            value: String(emp.id),
            label: `${emp.name} (${emp.email})`,
          }))}
          error={errors.user_id?.message}
          {...register('user_id')}
        />

        <Select
          label="Planning"
          required
          placeholder="Sélectionner un planning"
          options={[
            { value: '', label: planningLoading ? 'Chargement...' : '— Sélectionner un planning —' },
            ...planningOptions,
          ]}
          error={errors.planning_id?.message}
          {...register('planning_id')}
        />

        <Input
          label="Titre"
          required
          placeholder="Ex: Préparer le rapport hebdomadaire"
          error={errors.title?.message}
          {...register('title')}
        />

        <TextArea
          label="Description"
          placeholder="Description détaillée (optionnelle)"
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priorité"
            options={PRIORITY_OPTIONS}
            error={errors.priority?.message}
            {...register('priority')}
          />
          <Select
            label="Statut"
            options={STATUS_OPTIONS}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>

        <Input
          label="Date d'échéance"
          type="date"
          error={errors.due_date?.message}
          {...register('due_date')}
        />
      </div>
    </Modal>
  )
}

export default TaskFormModal
