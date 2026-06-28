import { useEffect, useState, useCallback } from 'react'
import { useDispatch }         from 'react-redux'
import { motion }              from 'framer-motion'
import { useAuth }             from '../../hooks/useAuth'
import profileService          from '../../services/profileService'
import {
  fetchMyPointagesThunk,
} from '../../features/pointage/pointageThunks'
import {
  fetchMyLeaveRequestsThunk,
} from '../../features/leave/leaveThunks'
import { useSelector }         from 'react-redux'
import {
  selectTodayPointage,
  selectIsCheckedIn,
} from '../../features/pointage/pointageSelectors'
import { selectPendingLeaveCount } from '../../features/leave/leaveSelectors'
import { Card, Badge, HoursBar, Skeleton, Avatar, RatingBadge, SkillBadge, ErrorState } from '../../components/ui'
import { formatTime, formatDate } from '../../utils/formatters'
import { getHoursClasses }     from '../../utils/hoursColor'
import { Clock, FileText, Zap } from 'lucide-react'
import { cn }                  from '../../utils/cn'

/**
 * Employee DashboardPage — /employee/dashboard
 *
 * Data from GET /v1/me:
 *   profile: user object with teams + skills
 *   stats: { weekly_hours, weekly_limit, hours_state, is_overtime, is_under_hours }
 *   current_rating: { has_rating, type, icon }
 *
 * Also shows: today's pointage status, upcoming shifts, pending leaves.
 *
 * Per spec:
 * - Today's shift
 * - Current task
 * - Weekly hours
 * - Remaining leave
 * - Notifications
 */
const DashboardPage = () => {
  const dispatch       = useDispatch()
  const { user }       = useAuth()
  const todayPointage  = useSelector(selectTodayPointage)
  const isCheckedIn    = useSelector(selectIsCheckedIn)

  const [profile,  setProfile]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const [profileData] = await Promise.all([
        profileService.getProfile(),
        dispatch(fetchMyPointagesThunk({})),
        dispatch(fetchMyLeaveRequestsThunk({})),
      ])
      setProfile(profileData)
    } catch (err) {
      setFetchError(err?.message || 'Impossible de charger les données')
    } finally {
      setLoading(false)
    }
  }, [dispatch])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const stats        = profile?.stats
  const currentRating= profile?.current_rating
  const userData     = profile?.profile || user
  const pendingLeaves= useSelector(selectPendingLeaveCount)

  const hoursClasses = stats ? getHoursClasses(stats.weekly_hours) : null

  // Today's planning — from profile teams
  const todayDate = new Date().toISOString().split('T')[0]

  if (fetchError) {
    return (
      <div className="flex flex-col gap-5">
        <ErrorState message={fetchError} onRetry={fetchAll} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Bonjour, {(userData?.name || '').split(' ')[0]} 👋
        </h1>
        <p className="mt-0.5 text-sm text-slate-400">
          {formatDate(new Date(), 'EEEE d MMMM yyyy')}
        </p>
      </motion.div>

      {/* KPI cards row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        {/* Weekly hours */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          {loading ? <Skeleton.Card /> : (
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Heures cette semaine
                </p>
                <div className="flex h-8 w-8 items-center justify-center
                                rounded-lg bg-brand-50 dark:bg-brand-900/20">
                  <Clock className="h-4 w-4 text-brand-500" />
                </div>
              </div>
              <p className={cn('text-2xl font-bold mb-1', hoursClasses?.text || 'text-slate-800 dark:text-slate-100')}>
                {stats?.weekly_hours ?? 0}h
              </p>
              <HoursBar
                hours={stats?.weekly_hours ?? 0}
                limit={stats?.weekly_limit ?? 44}
                showLabel={false}
              />
              {stats?.is_overtime && (
                <p className="mt-1.5 text-2xs text-red-500">
                  ⚠ Heures supplémentaires
                </p>
              )}
            </Card>
          )}
        </motion.div>

        {/* Current rating */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          {loading ? <Skeleton.Card /> : (
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Note cette semaine
                </p>
                <div className="flex h-8 w-8 items-center justify-center
                                rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <Zap className="h-4 w-4 text-amber-500" />
                </div>
              </div>
              {currentRating?.has_rating ? (
                <RatingBadge type={currentRating.type} size="md" />
              ) : (
                <p className="text-sm text-slate-400">Non évalué</p>
              )}
              {currentRating?.reason && (
                <p className="mt-1 text-2xs text-slate-400 line-clamp-2">
                  {currentRating.reason}
                </p>
              )}
            </Card>
          )}
        </motion.div>

        {/* Pointage status */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.11 }}
        >
          {loading ? <Skeleton.Card /> : (
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Présence aujourd'hui
                </p>
                <div className={cn(
                  'h-2 w-2 rounded-full',
                  isCheckedIn
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-slate-300 dark:bg-slate-600'
                )} />
              </div>
              <p className={cn(
                'text-lg font-bold',
                isCheckedIn
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400'
              )}>
                {isCheckedIn ? '✓ Présent' : 'Non pointé'}
              </p>
              {todayPointage?.check_in_at && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Entrée : {formatTime(todayPointage.check_in_at)}
                </p>
              )}
            </Card>
          )}
        </motion.div>

        {/* Pending leaves */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
        >
          {loading ? <Skeleton.Card /> : (
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Congés en attente
                </p>
                <div className="flex h-8 w-8 items-center justify-center
                                rounded-lg bg-violet-50 dark:bg-violet-900/20">
                  <FileText className="h-4 w-4 text-violet-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {pendingLeaves}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {pendingLeaves === 0 ? 'Aucune demande' : 'En attente d\'approbation'}
              </p>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Profile + teams row */}
      {!loading && userData && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <Card>
            <div className="flex items-start gap-4">
              <Avatar
                src={userData.avatar_url}
                name={userData.name}
                size="lg"
                ring
              />
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {userData.name}
                </p>
                <p className="text-sm text-slate-500">{userData.description}</p>

                {/* Teams */}
                {userData.teams?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {userData.teams.map((team) => (
                      <Badge key={team.id} variant="primary" size="sm">
                        {team.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Skills */}
                {userData.skills?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {userData.skills.slice(0, 5).map((skill) => (
                      <SkillBadge
                        key={skill.id}
                        name={skill.name}
                        level={skill.pivot?.level}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default DashboardPage