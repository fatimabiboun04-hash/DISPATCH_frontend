import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Edit2, Coffee } from 'lucide-react'
import {
  fetchEmployeeThunk,
  fetchEmployeeHistoryThunk,
  fetchEmployeePlanningThunk,
  fetchEmployeePointagesThunk,
} from '../../features/employees/employeeThunks'
import { clearDetail } from '../../features/employees/employeeSlice'
import {
  selectEmployeeDetail,
  selectEmployeeDetailLoading,
  selectEmployeeDetailError,
  selectEmployeeHistory,
  selectEmployeeHistoryLoading,
  selectProfilePlanning,
  selectProfilePlanningLoading,
  selectProfilePointages,
  selectProfilePointagesLoading,
} from '../../features/employees/employeeSelectors'
import ProfileHeader       from '../../components/employees/ProfileHeader'
import ProfileStatsCards   from '../../components/employees/ProfileStatsCards'
import ActivityTimeline    from '../../components/employees/ActivityTimeline'
import EmployeeFormModal   from '../../components/employees/EmployeeFormModal'
import {
  Tabs, Button, Card, Skeleton, ErrorState,
  Badge, StarRating,
} from '../../components/ui'
import { formatDate, formatTime, formatMinutesToHours } from '../../utils/formatters'
import { getShiftColor } from '../../constants/shiftColors'
import { cn } from '../../utils/cn'
import axiosInstance from '../../services/axiosInstance'
import { API } from '../../constants/apiRoutes'

const PROFILE_TABS = [
  { value: 'overview',  label: 'Vue d\'ensemble' },
  { value: 'planning',  label: 'Planning' },
  { value: 'pauses',    label: 'Pauses' },
  { value: 'leaves',    label: 'Congés' },
  { value: 'pointages', label: 'Pointages' },
  { value: 'timeline',  label: 'Activité' },
]

/**
 * EmployeeProfilePage — /admin/employees/:id
 *
 * Loads employee detail + all tab data.
 * Tabs: Overview | Planning | Leave History | Pointage History | Activity
 */
const EmployeeProfilePage = () => {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const dispatch    = useDispatch()

  const employee       = useSelector(selectEmployeeDetail)
  const loading        = useSelector(selectEmployeeDetailLoading)
  const error          = useSelector(selectEmployeeDetailError)
  const history        = useSelector(selectEmployeeHistory)
  const historyLoading = useSelector(selectEmployeeHistoryLoading)
  const planning       = useSelector(selectProfilePlanning)
  const planningLoading= useSelector(selectProfilePlanningLoading)
  const pointages      = useSelector(selectProfilePointages)
  const pointagesLoading = useSelector(selectProfilePointagesLoading)

  const [activeTab,  setActiveTab]  = useState('overview')
  const [editOpen,   setEditOpen]   = useState(false)
  const [leaveData,  setLeaveData]  = useState([])
  const [leaveLoading, setLeaveLoading] = useState(false)
  const [pauseData, setPauseData] = useState([])
  const [pauseLoading, setPauseLoading] = useState(false)
  const [profileStats] = useState(null)
  const [teams, setTeams] = useState([])
  const [skills, setSkills] = useState([])

  // Load employee on mount
  useEffect(() => {
    dispatch(fetchEmployeeThunk(id))
    dispatch(fetchEmployeeHistoryThunk({ id, params: { per_page: 30 } }))
    const load = async () => {
      setPauseLoading(true)
      try {
        const res = await axiosInstance.get(API.PAUSES.LIST, {
          params: { user_id: id, per_page: 50 },
        })
        setPauseData(res.data.data?.data || res.data.data || [])
      } catch { /* silently fail */ } finally {
        setPauseLoading(false)
      }
    }
    load()
    return () => dispatch(clearDetail())
  }, [id, dispatch])

  // Load tab data on tab switch
  useEffect(() => {
    if (!id) return
    if (activeTab === 'planning' && planning.length === 0) {
      dispatch(fetchEmployeePlanningThunk({ id, params: {} }))
    }
    if (activeTab === 'pointages' && pointages.length === 0) {
      dispatch(fetchEmployeePointagesThunk({ id, params: {} }))
    }
    if (activeTab === 'pauses' && pauseData.length === 0) {
      const load = async () => {
        setPauseLoading(true)
        try {
          const res = await axiosInstance.get(API.PAUSES.LIST, {
            params: { user_id: id, per_page: 50 },
          })
          setPauseData(res.data.data?.data || res.data.data || [])
        } catch { /* silently fail */ } finally {
          setPauseLoading(false)
        }
      }
      load()
    }
    if (activeTab === 'leaves' && leaveData.length === 0) {
      const load = async () => {
        setLeaveLoading(true)
        try {
          const res = await axiosInstance.get(API.LEAVE.LIST, {
            params: { user_id: id },
          })
          setLeaveData(res.data.data || [])
        } catch { /* silently fail */ } finally {
          setLeaveLoading(false)
        }
      }
      load()
    }
  }, [activeTab, id, planning.length, pointages.length, leaveData.length, dispatch])

  // Fetch teams + skills for edit modal
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [teamsRes, skillsRes] = await Promise.all([
          axiosInstance.get(API.TEAMS.LIST),
          axiosInstance.get(API.SKILLS.LIST),
        ])
        setTeams(teamsRes.data.data || [])
        setSkills(skillsRes.data.data || [])
      } catch { /* non-critical */ }
    }
    fetchMeta()
  }, [])

  // Derive current rating from employee data
  const currentRating = useMemo(() => {
    if (!employee) return null
    const rating = employee.ratings?.[0]
    return rating
      ? { has_rating: true, score: rating.score, type: rating.type, comment: rating.comment || rating.reason }
      : { has_rating: false }
  }, [employee])

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton.Block className="h-48 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton.Card key={i} />)}
        </div>
        <Skeleton.Block className="h-64 rounded-xl" />
      </div>
    )
  }

  if (error || !employee) {
    return (
      <ErrorState
        message={error || 'Employé introuvable'}
        onRetry={() => dispatch(fetchEmployeeThunk(id))}
      />
    )
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Back + Edit */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/employees')}
          className="flex items-center gap-2 text-sm text-slate-500
                     hover:text-slate-700 dark:text-slate-400
                     dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux employés
        </button>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Edit2 className="h-3.5 w-3.5" />}
          onClick={() => setEditOpen(true)}
        >
          Modifier
        </Button>
      </div>

      {/* Profile header */}
      <ProfileHeader
        employee={employee}
        currentRating={currentRating}
      />

      {/* Stats cards */}
      <ProfileStatsCards
        stats={profileStats || {
          weekly_hours: 0, weekly_limit: employee.weekly_hours_limit || 44,
          hours_state: 'green', is_overtime: false, is_under_hours: false,
          monthly_hours: 0, current_week: 1,
        }}
        currentRating={currentRating}
      />

      {/* Tabs */}
      <Card padding="p-0">
        <div className="px-5 pt-4">
          <Tabs
            tabs={PROFILE_TABS}
            value={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="px-5 py-5">

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider
                                text-slate-400">
                    Informations
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: 'Rôle',   value: employee.role === 'admin' ? 'Administrateur' : 'Employé' },
                      { label: 'Email',  value: employee.email },
                      { label: 'Tél',    value: employee.phone || '—' },
                      { label: 'Statut', value: employee.status === 'active' ? 'Actif' : 'Suspendu' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center gap-2 text-sm">
                        <span className="w-16 flex-shrink-0 text-xs text-slate-400">{label}</span>
                        <span className="text-slate-700 dark:text-slate-200">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {employee.description && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Description
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {employee.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Current pause */}
              {pauseData.some((p) => p.status === 'active') && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                  <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">
                    Pause en cours
                  </p>
                  {pauseData.filter((p) => p.status === 'active').slice(0, 1).map((p) => (
                    <p key={p.id} className="text-sm text-green-700 dark:text-green-300">
                      {p.pause_start} → {p.pause_end} ({p.duration_minutes} min)
                      {p.type ? ` · ${p.type}` : ''}
                    </p>
                  ))}
                </div>
              )}

              {/* Rating history (last 5) */}
              {employee.ratings?.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Historique des notes
                  </p>
                  <div className="space-y-2">
                    {employee.ratings.slice(0, 5).map((r) => (
                      <div key={r.id}
                           className="flex items-center justify-between rounded-lg
                                       border border-surface-100 px-3 py-2
                                       dark:border-dark-600">
                        <div className="flex items-center gap-2">
                          {r.score ? (
                            <StarRating value={r.score} readonly size="sm" />
                          ) : (
                            <Badge variant={r.type === 'excellent' ? 'success' : 'danger'} size="sm">
                              {r.type === 'excellent' ? 'Excellent' : 'À améliorer'}
                            </Badge>
                          )}
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {r.comment || r.reason || ''}
                          </span>
                        </div>
                        <span className="text-2xs text-slate-400">
                          S{r.week_number}/{r.year}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Planning tab */}
          {activeTab === 'planning' && (
            planningLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton.Block key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : planning.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                Aucun planning trouvé
              </div>
            ) : (
              <div className="space-y-2">
                {planning.map((p) => {
                  const shiftColor = getShiftColor(p.shift?.type)
                  return (
                    <div key={p.id}
                         className="flex items-center gap-4 rounded-xl
                                    border border-surface-100 px-4 py-3
                                    dark:border-dark-600">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200 w-28">
                        {formatDate(p.date, 'EEE dd MMM')}
                      </div>
                      <span className={cn(
                        'rounded-lg px-2.5 py-1 text-xs font-medium',
                        shiftColor.bg, shiftColor.text
                      )}>
                        {p.shift?.name || '—'}
                      </span>
                      {p.team && (
                        <Badge variant="default" size="sm">{p.team.name}</Badge>
                      )}
                      {p.is_locked && (
                        <Badge variant="warning" size="sm">Verrouillé</Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          )}

          {/* Pause history tab */}
          {activeTab === 'pauses' && (
            pauseLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton.Block key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            ) : pauseData.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                Aucune pause enregistrée
              </div>
            ) : (
              <div className="space-y-2">
                {pauseData.map((p) => {
                  const statusCfg = {
                    scheduled: { label: 'Planifiée', variant: 'info' },
                    active:    { label: 'En cours', variant: 'success' },
                    completed: { label: 'Terminée', variant: 'default' },
                    cancelled: { label: 'Annulée', variant: 'warning' },
                    expired:   { label: 'Expirée', variant: 'danger' },
                  }[p.status] || { label: p.status, variant: 'default' }
                  return (
                    <div key={p.id}
                         className="flex items-center justify-between rounded-xl
                                    border border-surface-100 px-4 py-3
                                    dark:border-dark-600">
                      <div className="flex items-center gap-3">
                        <Coffee className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            {p.pause_start} → {p.pause_end}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatDate(p.created_at)}
                            {p.type ? ` · ${p.type}` : ''}
                            {p.duration_minutes ? ` · ${p.duration_minutes} min` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.reason && (
                          <span className="text-xs text-slate-400 max-w-[120px] truncate">
                            {p.reason}
                          </span>
                        )}
                        <Badge variant={statusCfg.variant} size="sm">
                          {statusCfg.label}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          )}

          {/* Leave history tab */}
          {activeTab === 'leaves' && (
            leaveLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton.Block key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            ) : leaveData.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                Aucune demande de congé
              </div>
            ) : (
              <div className="space-y-2">
                {leaveData.map((leave) => (
                  <div key={leave.id}
                       className="flex items-center justify-between rounded-xl
                                  border border-surface-100 px-4 py-3
                                  dark:border-dark-600">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {formatDate(leave.start_date)} → {formatDate(leave.end_date)}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{leave.reason}</p>
                    </div>
                    <Badge
                      variant={
                        leave.status === 'approved' ? 'success'
                        : leave.status === 'rejected' ? 'danger'
                        : 'warning'
                      }
                    >
                      {leave.status === 'approved' ? 'Approuvé'
                       : leave.status === 'rejected' ? 'Refusé'
                       : 'En attente'}
                    </Badge>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Pointage history tab */}
          {activeTab === 'pointages' && (
            pointagesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton.Block key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : pointages.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                Aucun pointage enregistré
              </div>
            ) : (
              <div className="space-y-2">
                {pointages.map((p) => (
                  <div key={p.id}
                       className="flex items-center gap-4 rounded-xl
                                  border border-surface-100 px-4 py-3
                                  dark:border-dark-600">
                    <div className="w-32">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        {formatDate(p.check_in_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs text-slate-500">
                        {formatTime(p.check_in_at)} → {p.check_out_at ? formatTime(p.check_out_at) : '—'}
                      </span>
                      {p.worked_minutes > 0 && (
                        <Badge variant="default" size="sm">
                          {formatMinutesToHours(p.worked_minutes, true)}
                        </Badge>
                      )}
                    </div>
                    <Badge
                      variant={
                        p.status === 'present' ? 'success'
                        : p.status === 'late'    ? 'warning'
                        : 'danger'
                      }
                      size="sm"
                    >
                      {p.status === 'present' ? '✓ À l\'heure'
                       : p.status === 'late'   ? '⚠ Retard'
                       : '✗ Absent'}
                    </Badge>
                    {p.is_flagged && (
                      <Badge variant="danger" size="sm">Suspect</Badge>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {/* Activity timeline tab */}
          {activeTab === 'timeline' && (
            <ActivityTimeline
              items={history}
              loading={historyLoading}
            />
          )}
        </div>
      </Card>

      {/* Edit modal */}
      <EmployeeFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        employee={employee}
        teams={teams}
        skills={skills}
        onSuccess={() => dispatch(fetchEmployeeThunk(id))}
      />
    </div>
  )
}

export default EmployeeProfilePage
