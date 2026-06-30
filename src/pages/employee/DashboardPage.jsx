import { useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import profileService from '../../services/profileService'
import employeePlanningService from '../../services/employeePlanningService'
import {
  fetchMyPointagesThunk,
} from '../../features/pointage/pointageThunks'
import {
  fetchMyLeaveRequestsThunk,
} from '../../features/leave/leaveThunks'
import { useSelector } from 'react-redux'
import {
  selectTodayPointage,
  selectIsCheckedIn,
} from '../../features/pointage/pointageSelectors'
import { selectPendingLeaveCount } from '../../features/leave/leaveSelectors'
import { Card, Badge, HoursBar, Skeleton, Avatar, SkillBadge, ErrorState } from '../../components/ui'
import { formatTime, formatDate } from '../../utils/formatters'
import { getHoursClasses } from '../../utils/hoursColor'
import { Clock, FileText, Calendar, Coffee, Briefcase } from 'lucide-react'
import { cn } from '../../utils/cn'

const POLL_INTERVAL = 30000

const getShiftState = (startTime, endTime) => {
  if (!startTime) return null
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = (endTime || '23:59').split(':').map(Number)
  const startMin = sh * 60 + sm
  const endMin = eh * 60 + em
  if (nowMin >= startMin && nowMin < endMin) return 'ACTIVE'
  if (nowMin >= endMin) return 'ENDED'
  return 'UPCOMING'
}

const stateConfig = {
  ACTIVE: { dot: 'bg-emerald-500 animate-pulse', text: 'text-emerald-600', label: 'En cours' },
  UPCOMING: { dot: 'bg-blue-500', text: 'text-blue-600', label: 'À venir' },
  ENDED: { dot: 'bg-slate-300', text: 'text-slate-400', label: 'Terminé' },
}

const DashboardPage = () => {
  const dispatch = useDispatch()
  const { user } = useAuth()
  const todayPointage = useSelector(selectTodayPointage)
  const isCheckedIn = useSelector(selectIsCheckedIn)

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [dashData, setDashData] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const [profileData, dashRes] = await Promise.all([
        profileService.getProfile(),
        employeePlanningService.getMyDashboard(),
        dispatch(fetchMyPointagesThunk({})),
        dispatch(fetchMyLeaveRequestsThunk({})),
      ])
      setProfile(profileData)
      setDashData(dashRes.data?.data || null)
    } catch (err) {
      setFetchError(err?.message || 'Impossible de charger les données')
    } finally {
      setLoading(false)
    }
  }, [dispatch])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(fetchAll, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchAll])

  const stats = profile?.stats
  const userData = profile?.profile || user
  const pendingLeaves = useSelector(selectPendingLeaveCount)
  const hoursClasses = stats ? getHoursClasses(stats.weekly_hours) : null

  const todayShift = dashData?.today
  const nextShift = dashData?.next
  const activePause = dashData?.active_pause
  const todayShiftState = todayShift?.shift
    ? getShiftState(todayShift.shift.start_time, todayShift.shift.end_time)
    : null
  const todayCfg = stateConfig[todayShiftState] || null

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
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Bonjour, {(userData?.name || '').split(' ')[0]}
        </h1>
        <p className="mt-0.5 text-sm text-slate-400">
          {formatDate(new Date(), 'EEEE d MMMM yyyy')}
        </p>
      </motion.div>

      {/* Today's shift card */}
      {loading ? (
        <Skeleton.Block className="h-20 rounded-xl" />
      ) : todayShift?.shift ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.02 }}
          className={cn(
            'rounded-xl border-l-4 p-4 flex items-center gap-4',
            todayShiftState === 'ACTIVE'
              ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/15'
              : todayShiftState === 'UPCOMING'
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/15'
              : 'border-slate-200 bg-surface-50 dark:border-dark-600 dark:bg-dark-800'
          )}
        >
          <div className={cn('h-3 w-3 rounded-full flex-shrink-0', todayCfg?.dot)} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn('text-sm font-bold', todayCfg?.text || 'text-slate-600')}>
                {todayShift.shift.name}
              </p>
              {todayCfg && (
                <span className={cn('text-2xs font-semibold', todayCfg.text)}>
                  · {todayCfg.label}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {todayShift.shift.start_time} – {todayShift.shift.end_time}
              {todayShift.duration_hours ? ` (${todayShift.duration_hours}h)` : ''}
            </p>
            {todayShift.team && (
              <p className="text-2xs text-slate-400 mt-0.5">
                {todayShift.team.name}
              </p>
            )}
          </div>
          {todayShift.tasks_count > 0 && (
            <span className="flex items-center gap-1 text-2xs text-slate-400 flex-shrink-0">
              <Briefcase className="h-3 w-3" />
              {todayShift.tasks_count}
            </span>
          )}
          {activePause && (
            <span className="flex items-center gap-1 text-2xs text-amber-500 flex-shrink-0">
              <Coffee className="h-3 w-3" />
              Pause
            </span>
          )}
        </motion.div>
      ) : null}

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
                <p className="text-xs text-slate-500 dark:text-slate-400">Heures cette semaine</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
                  <Clock className="h-4 w-4 text-brand-500" />
                </div>
              </div>
              <p className={cn('text-2xl font-bold mb-1', hoursClasses?.text || 'text-slate-800 dark:text-slate-100')}>
                {dashData?.weekly_hours ?? stats?.weekly_hours ?? 0}h
              </p>
              <HoursBar hours={dashData?.weekly_hours ?? stats?.weekly_hours ?? 0} limit={44} showLabel={false} />
              {(dashData?.weekly_overtime ?? 0) > 0 && (
                <p className="mt-1.5 text-2xs text-red-500">
                  {dashData.weekly_overtime}h supp.
                </p>
              )}
            </Card>
          )}
        </motion.div>

        {/* Next shift */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          {loading ? <Skeleton.Card /> : (
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">Prochain shift</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Calendar className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              {nextShift?.shift ? (
                <>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {nextShift.shift.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {nextShift.date}
                  </p>
                  <p className="text-xs text-slate-400">
                    {nextShift.shift.start_time} – {nextShift.shift.end_time}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-400">Aucun prochain shift</p>
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
                <p className="text-xs text-slate-500 dark:text-slate-400">Présence aujourd'hui</p>
                <div className={cn(
                  'h-2 w-2 rounded-full',
                  isCheckedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'
                )} />
              </div>
              <p className={cn(
                'text-lg font-bold',
                isCheckedIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
              )}>
                {isCheckedIn ? 'Présent' : 'Non pointé'}
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
                <p className="text-xs text-slate-500 dark:text-slate-400">Congés en attente</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-900/20">
                  <FileText className="h-4 w-4 text-violet-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {pendingLeaves}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {pendingLeaves === 0 ? 'Aucune demande' : "En attente d'approbation"}
              </p>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Active pause banner */}
      {activePause && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/10"
        >
          <div className="flex items-center gap-2">
            <Coffee className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Pause en cours
            </span>
            <span className="text-xs text-amber-500">
              ({activePause.pause_start}{activePause.pause_end ? ` – ${activePause.pause_end}` : ''})
            </span>
          </div>
        </motion.div>
      )}

      {/* Profile + teams row */}
      {!loading && userData && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <Card>
            <div className="flex items-start gap-4">
              <Avatar src={userData.avatar_url} name={userData.name} size="lg" ring />
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-slate-800 dark:text-slate-100">{userData.name}</p>
                <p className="text-sm text-slate-500">{userData.description}</p>
                {userData.teams?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {userData.teams.map((team) => (
                      <Badge key={team.id} variant="primary" size="sm">{team.name}</Badge>
                    ))}
                  </div>
                )}
                {userData.skills?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {userData.skills.slice(0, 5).map((skill) => (
                      <SkillBadge key={skill.id} name={skill.name} level={skill.pivot?.level} />
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
