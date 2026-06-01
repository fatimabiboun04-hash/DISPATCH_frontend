import { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { UserPlus, UserMinus, Search } from 'lucide-react'
import {
  assignEmployeeThunk,
  removeEmployeeThunk,
} from '../../features/teams/teamThunks'
import { selectTeamSubmitting } from '../../features/teams/teamSelectors'
import { Modal, Avatar, Badge, Button, Skeleton } from '../ui'
import { cn } from '../../utils/cn'
import toast from 'react-hot-toast'

/**
 * TeamAssignModal — add / remove employees from a team.
 *
 * Shows two columns:
 * - Left:  employees already in team (with remove button)
 * - Right: all employees NOT in team (with assign button)
 *
 * Backend:
 *   Assign → POST /v1/teams/{team}/assign { user_id }
 *            uses syncWithoutDetaching — never removes existing members
 *   Remove → DELETE /v1/teams/{team}/remove/{user}
 *
 * team.users → current members (from paginatedResponse)
 * allEmployees → passed as prop from parent (fetched separately)
 */
const TeamAssignModal = ({
  open,
  onClose,
  team,            // { id, name, users: [...] }
  allEmployees = [],
  onSuccess,
}) => {
  const dispatch   = useDispatch()
  const submitting = useSelector(selectTeamSubmitting)
  const [search,   setSearch]   = useState('')
  const [actionId, setActionId] = useState(null) // per-employee loading

 const memberIds = new Set(team?.users?.map((u) => u.id) || [])

const members = team?.users || []

const nonMembers = allEmployees.filter(
  (e) => !memberIds.has(e.id)
)

const filteredNonMembers = useMemo(() => {
  return nonMembers.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  )
}, [nonMembers, search])

if (!team) return null

  const handleAssign = async (employee) => {
    setActionId(employee.id)
    const result = await dispatch(assignEmployeeThunk({
      teamId: team.id,
      userId: employee.id,
    }))
    setActionId(null)
    if (assignEmployeeThunk.fulfilled.match(result)) {
      toast.success(`${employee.name} ajouté à ${team.name}`)
      onSuccess?.(result.payload)
    } else {
      toast.error('Erreur lors de l\'ajout')
    }
  }

  const handleRemove = async (employee) => {
    setActionId(employee.id)
    const result = await dispatch(removeEmployeeThunk({
      teamId: team.id,
      userId: employee.id,
    }))
    setActionId(null)
    if (removeEmployeeThunk.fulfilled.match(result)) {
      toast.success(`${employee.name} retiré de ${team.name}`)
      onSuccess?.(result.payload)
    } else {
      toast.error('Erreur lors du retrait')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Gérer les membres — ${team.name}`}
      subtitle={`${members.length} membre(s) actuel(s)`}
      size="lg"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Fermer
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-5 min-h-64">

        {/* Left — Current members */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider
                        text-slate-400">
            Membres actuels
            <span className="ml-2 rounded-full bg-brand-100 px-1.5 py-0.5
                             text-2xs font-bold text-brand-600
                             dark:bg-brand-900/30 dark:text-brand-400">
              {members.length}
            </span>
          </p>

          {members.length === 0 ? (
            <p className="text-sm text-slate-400 italic py-4">
              Aucun membre
            </p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {members.map((user) => (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="flex items-center gap-2.5 rounded-xl
                             border border-surface-100 bg-surface-50 p-2.5
                             dark:border-dark-600 dark:bg-dark-800"
                >
                  <Avatar
                    src={user.avatar_url}
                    name={user.name}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium
                                  text-slate-700 dark:text-slate-200">
                      {user.name}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={actionId === user.id}
                    onClick={() => handleRemove(user)}
                    className="h-7 w-7 p-0 flex-shrink-0
                               text-red-400 hover:bg-red-50
                               hover:text-red-600 dark:hover:bg-red-900/20"
                  >
                    {actionId !== user.id && <UserMinus className="h-3.5 w-3.5" />}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right — Available employees to add */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider
                        text-slate-400">
            Ajouter des membres
          </p>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-2.5 top-1/2
                               h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="h-8 w-full rounded-lg border border-surface-200
                         bg-white pl-8 pr-3 text-xs text-slate-700
                         placeholder-slate-400 outline-none
                         focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20
                         dark:border-dark-400 dark:bg-dark-700 dark:text-slate-200"
            />
          </div>

          {filteredNonMembers.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400 italic">
              {search ? 'Aucun résultat' : 'Tous les employés sont membres'}
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {filteredNonMembers.map((user) => (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2.5 rounded-xl
                             border border-surface-100 p-2.5
                             dark:border-dark-600"
                >
                  <Avatar
                    src={user.avatar_url}
                    name={user.name}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium
                                  text-slate-700 dark:text-slate-200">
                      {user.name}
                    </p>
                    <p className="truncate text-2xs text-slate-400">
                      {user.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={actionId === user.id}
                    onClick={() => handleAssign(user)}
                    className="h-7 w-7 p-0 flex-shrink-0
                               text-emerald-500 hover:bg-emerald-50
                               hover:text-emerald-600
                               dark:hover:bg-emerald-900/20"
                  >
                    {actionId !== user.id && <UserPlus className="h-3.5 w-3.5" />}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default TeamAssignModal