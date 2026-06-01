import { useNavigate }        from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion }             from 'framer-motion'
import { Edit2, Trash2, Eye } from 'lucide-react'
import {
  selectEmployeeList,
  selectEmployeeListLoading,
  selectEmployeeListError,
  selectEmployeeMeta,
  selectEmployeeFilters,
} from '../../features/employees/employeeSelectors'
import { setFilters } from '../../features/employees/employeeSlice'
import {
  Avatar, Badge, Skeleton, EmptyState, ErrorState,
  Pagination, RatingBadge, SkillBadge, Tooltip, Button,
} from '../ui'
import RatingToggle      from './RatingToggle'
import EmployeeStatusBadge from './EmployeeStatusBadge'
import { Users }         from 'lucide-react'
import { cn }            from '../../utils/cn'

/**
 * EmployeeTable — main data table for the employees list page.
 *
 * Columns: Avatar | Name | Email | Teams | Skills | Rating | Status | Actions
 *
 * Rating: uses RatingToggle component.
 * Avatar: uses Avatar component (image or initials+gradient fallback).
 * Skills: shows first 2 + "+N more" badge.
 * Teams: shows first 2 team names.
 */
const EmployeeTable = ({ onEdit, onDelete }) => {
  const navigate  = useNavigate()
  const dispatch  = useDispatch()
  const employees = useSelector(selectEmployeeList)
  const loading   = useSelector(selectEmployeeListLoading)
  const error     = useSelector(selectEmployeeListError)
  const meta      = useSelector(selectEmployeeMeta)
  const filters   = useSelector(selectEmployeeFilters)

  if (loading && employees.length === 0) {
    return (
      <div className="rounded-xl border border-surface-200 bg-white
                      dark:border-dark-600 dark:bg-dark-700">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}
               className="flex items-center gap-4 border-b border-surface-100
                          px-4 py-3.5 last:border-0 dark:border-dark-600">
            <Skeleton.Circle size="h-9 w-9" />
            <Skeleton.Line width="w-32" height="h-3.5" />
            <Skeleton.Line width="w-48" height="h-3" />
            <Skeleton.Line width="w-20" height="h-3" />
            <Skeleton.Line width="w-24" height="h-3" />
            <Skeleton.Line width="w-16" height="h-5 rounded-full" />
            <Skeleton.Line width="w-16" height="h-5 rounded-full" />
            <Skeleton.Line width="w-20" height="h-7 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} />
  }

  if (employees.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Aucun employé trouvé"
        description="Modifiez vos filtres ou ajoutez un nouvel employé."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-surface-200
                      bg-white dark:border-dark-600 dark:bg-dark-700">
        <table className="w-full min-w-full">
          {/* Head */}
          <thead>
            <tr className="border-b border-surface-100 bg-surface-50
                           dark:border-dark-600 dark:bg-dark-800">
              {['Employé', 'Email', 'Équipes', 'Compétences', 'Note', 'Statut', 'Actions'].map((h) => (
                <th key={h}
                    className="px-4 py-3 text-left text-2xs font-semibold
                               uppercase tracking-wider text-slate-500
                               dark:text-slate-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-surface-100 dark:divide-dark-600">
            {employees.map((emp, i) => {
              // Get current week rating from the loaded ratings array
              const currentWeekRating = emp.ratings?.find(
                (r) => r.week_number === new Date().getWeek?.() || true
              ) || emp.ratings?.[0] || null

              const currentRating = currentWeekRating
                ? { has_rating: true, type: currentWeekRating.type, icon: currentWeekRating.type === 'excellent' ? '⭐' : '🚩' }
                : { has_rating: false, type: null }

              return (
                <motion.tr
                  key={emp.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15, delay: i * 0.03 }}
                  className="group transition-colors duration-100
                             hover:bg-surface-50 dark:hover:bg-dark-600"
                >
                  {/* Avatar + Name */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={emp.avatar_url}
                        name={emp.name}
                        size="sm"
                        ring
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {emp.name}
                        </p>
                        {emp.description && (
                          <p className="text-2xs text-slate-400 dark:text-slate-500 truncate max-w-32">
                            {emp.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {emp.email}
                    </span>
                  </td>

                  {/* Teams */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {emp.teams?.slice(0, 2).map((team) => (
                        <Badge key={team.id} variant="default" size="sm">
                          {team.name}
                        </Badge>
                      ))}
                      {emp.teams?.length > 2 && (
                        <Badge variant="default" size="sm">
                          +{emp.teams.length - 2}
                        </Badge>
                      )}
                      {(!emp.teams || emp.teams.length === 0) && (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </div>
                  </td>

                  {/* Skills */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {emp.skills?.slice(0, 2).map((skill) => (
                        <SkillBadge
                          key={skill.id}
                          name={skill.name}
                          level={skill.pivot?.level}
                        />
                      ))}
                      {emp.skills?.length > 2 && (
                        <Badge variant="default" size="sm">
                          +{emp.skills.length - 2}
                        </Badge>
                      )}
                      {(!emp.skills || emp.skills.length === 0) && (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <RatingToggle
                        employeeId={emp.id}
                        currentRating={currentRating}
                      />
                      {currentRating.has_rating && (
                        <RatingBadge type={currentRating.type} showLabel={false} />
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <EmployeeStatusBadge status={emp.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 opacity-0
                                    group-hover:opacity-100 transition-opacity">
                      <Tooltip content="Voir le profil">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => navigate(`/admin/employees/${emp.id}`)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Modifier">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => onEdit?.(emp)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Supprimer">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                          onClick={() => onDelete?.(emp)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </Tooltip>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Rating legend */}
      <div className="flex items-center gap-4 px-1">
        <span className="text-xs text-slate-400">Notation :</span>
        <div className="flex items-center gap-1.5">
          <span className="text-sm">⭐</span>
          <span className="text-xs text-slate-500">= Performance excellente</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🚩</span>
          <span className="text-xs text-slate-500">= Nécessite attention</span>
        </div>
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <Pagination
          currentPage={meta.current_page}
          lastPage={meta.last_page}
          total={meta.total}
          perPage={meta.per_page}
          onPageChange={(page) => dispatch(setFilters({ page }))}
        />
      )}
    </div>
  )
}

export default EmployeeTable