import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector }          from 'react-redux'
import { motion }                            from 'framer-motion'
import { Plus, RefreshCw }                   from 'lucide-react'
import toast                                 from 'react-hot-toast'
import {
  fetchTeamsThunk,
  deleteTeamThunk,
} from '../../features/teams/teamThunks'
import {
  selectTeamList,
  selectTeamListLoading,
  selectTeamListError,
} from '../../features/teams/teamSelectors'
import TeamsGrid       from '../../components/teams/TeamsGrid'
import TeamModal       from '../../components/teams/TeamModal'
import TeamAssignModal from '../../components/teams/TeamAssignModal'
import { Button, ConfirmDialog } from '../../components/ui'
import axiosInstance   from '../../services/axiosInstance'
import { API }         from '../../constants/apiRoutes'

/**
 * TeamsPage — /admin/teams
 *
 * Layout: Header + "Ajouter une équipe" button + card grid
 *
 * Modals:
 * - TeamModal:       create / edit team
 * - TeamAssignModal: add / remove members
 * - ConfirmDialog:   delete confirmation
 *
 * allEmployees fetched once for TeamAssignModal (search within modal)
 */
const TeamsPage = () => {
  const dispatch = useDispatch()
  const teams    = useSelector(selectTeamList)
  const loading  = useSelector(selectTeamListLoading)
  const error    = useSelector(selectTeamListError)

  // Modal states
  const [formOpen,      setFormOpen]      = useState(false)
  const [editTeam,      setEditTeam]      = useState(null)
  const [assignTarget,  setAssignTarget]  = useState(null)
  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [deleting,      setDeleting]      = useState(false)

  // All employees for assign modal
  const [allEmployees, setAllEmployees] = useState([])

  const fetchTeams = useCallback(() => {
    dispatch(fetchTeamsThunk({}))
  }, [dispatch])

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  // Fetch all employees once for member assignment
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Fetch all pages if needed — simple approach: per_page=100
        const res = await axiosInstance.get(API.EMPLOYEES.LIST, {
          params: { per_page: 100 },
        })
        setAllEmployees(res.data.data || [])
      } catch {
        // Non-critical
      }
    }
    fetchEmployees()
  }, [])

  const handleEdit = (team) => {
    setEditTeam(team)
    setFormOpen(true)
  }

  const handleManageMembers = (team) => {
    // Find the live version from Redux state (has updated users)
    const liveTeam = teams.find((t) => t.id === team.id) || team
    setAssignTarget(liveTeam)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await dispatch(deleteTeamThunk(deleteTarget.id))
    setDeleting(false)
    if (deleteTeamThunk.fulfilled.match(result)) {
      toast.success(`${deleteTarget.name} supprimée`)
      setDeleteTarget(null)
    } else {
      toast.error('Erreur lors de la suppression')
    }
  }

  // Keep assignTarget in sync with Redux state (members update live)
  const liveAssignTarget = assignTarget
    ? teams.find((t) => t.id === assignTarget.id) || assignTarget
    : null

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Équipes
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">
            {teams.length > 0
              ? `${teams.length} équipe${teams.length > 1 ? 's' : ''}`
              : 'Organisez vos employés en équipes'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={fetchTeams}
          >
            Actualiser
          </Button>
          <Button
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditTeam(null)
              setFormOpen(true)
            }}
          >
            Ajouter une équipe
          </Button>
        </div>
      </motion.div>

      {/* Card grid */}
      <TeamsGrid
        teams={teams}
        loading={loading}
        error={error}
        onRetry={fetchTeams}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
        onManageMembers={handleManageMembers}
      />

      {/* Create / Edit modal */}
      <TeamModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTeam(null) }}
        team={editTeam}
        employees={allEmployees}
        onSuccess={() => fetchTeams()}
      />

      {/* Assign members modal */}
      <TeamAssignModal
        open={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        team={liveAssignTarget}
        allEmployees={allEmployees}
        onSuccess={() => {
          // Redux state already updated by thunk
          // Re-fetch to ensure consistency
          fetchTeams()
        }}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Supprimer l'équipe"
        description={`Supprimer "${deleteTarget?.name}" ? Les employés ne seront pas supprimés, seulement retirés de l'équipe.`}
      />
    </div>
  )
}

export default TeamsPage