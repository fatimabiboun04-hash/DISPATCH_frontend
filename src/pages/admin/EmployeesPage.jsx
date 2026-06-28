import { useEffect, useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector }          from 'react-redux'
import { motion }                            from 'framer-motion'
import toast                                 from 'react-hot-toast'
import { fetchEmployeesThunk, deleteEmployeeThunk } from '../../features/employees/employeeThunks'
import { selectEmployeeFilters }             from '../../features/employees/employeeSelectors'
import EmployeeFilters                       from '../../components/employees/EmployeeFilters'
import EmployeeTable                         from '../../components/employees/EmployeeTable'
import EmployeeFormModal                     from '../../components/employees/EmployeeFormModal'
import { ConfirmDialog }                     from '../../components/ui'
import axiosInstance                         from '../../services/axiosInstance'
import { API }                               from '../../constants/apiRoutes'

/**
 * EmployeesPage — /admin/employees
 *
 * Orchestrates: filter state, fetch on filter change,
 * create/edit modal, delete confirmation.
 *
 * Fetches teams and skills once for the form modal dropdowns.
 */
const EmployeesPage = () => {
  const dispatch = useDispatch()
  const filters  = useSelector(selectEmployeeFilters)

  const [formOpen,       setFormOpen]       = useState(false)
  const [editEmployee,   setEditEmployee]   = useState(null)
  const [deleteTarget,   setDeleteTarget]   = useState(null)
  const [deleting,       setDeleting]       = useState(false)
  const [teams,          setTeams]          = useState([])
  const [skills,         setSkills]         = useState([])

  // Fetch teams + skills for form modal (once)
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [teamsRes, skillsRes] = await Promise.all([
          axiosInstance.get(API.TEAMS.LIST),
          axiosInstance.get(API.SKILLS.LIST),
        ])
        setTeams(teamsRes.data.data || [])
        setSkills(skillsRes.data.data || [])
      } catch {
        // Non-critical — form still works without pre-populated options
      }
    }
    fetchMeta()
  }, [])

  // Fetch employees when filters change (debounced on search)
  const fetchEmployees = useCallback(() => {
    dispatch(fetchEmployeesThunk({
      search:  filters.search,
      team_id: filters.team_id,
      status:  filters.status,
      page:    filters.page,
    }))
  }, [dispatch, filters])

  useEffect(() => {
    const timer = setTimeout(fetchEmployees, filters.search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [fetchEmployees, filters])

  const handleEdit = (employee) => {
    setEditEmployee(employee)
    setFormOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await dispatch(deleteEmployeeThunk(deleteTarget.id))
    setDeleting(false)
    if (deleteEmployeeThunk.fulfilled.match(result)) {
      toast.success(`${deleteTarget.name} supprimé`)
      setDeleteTarget(null)
    } else {
      toast.error('Erreur lors de la suppression')
    }
  }

  const teamOptions = useMemo(() => teams.map((t) => ({ value: t.id, label: t.name })), [teams])

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Employés
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Gérez les membres de votre organisation
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <EmployeeFilters
        teams={teamOptions}
        onAddEmployee={() => {
          setEditEmployee(null)
          setFormOpen(true)
        }}
      />

      {/* Table */}
      <EmployeeTable
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
      />

      {/* Create / Edit Modal */}
      <EmployeeFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditEmployee(null) }}
        employee={editEmployee}
        teams={teams}
        skills={skills}
        onSuccess={() => fetchEmployees()}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Supprimer l'employé"
        description={`Êtes-vous sûr de vouloir supprimer ${deleteTarget?.name} ? Cette action est irréversible.`}
      />
    </div>
  )
}

export default EmployeesPage
