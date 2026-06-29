import { useMemo, useCallback, useState, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
  DndContext, closestCenter,
  PointerSensor, useSensor, useSensors, DragOverlay,
  useDraggable, useDroppable,
} from '@dnd-kit/core'
import {
  Plus, Coffee, Lock, Trash2, Clock, Users,
  AlertTriangle, ChevronDown, ChevronRight, Star,
  UserCheck, UserX, Briefcase,
} from 'lucide-react'
import {
  selectPlanningByDate,
  selectPlanningLoading,
  selectHasLockedRecords,
  selectPlanningData,
} from '../../features/planning/planningSelectors'
import { selectPausesMap } from '../../features/pauses/pauseSelectors'
import { selectAdminLeaveList } from '../../features/leave/leaveSelectors'
import { updatePlanningThunk } from '../../features/planning/planningThunks'
import { clearConflictErrors } from '../../features/planning/planningSlice'
import { getShiftColor } from '../../constants/shiftColors'
import { cn } from '../../utils/cn'
import { Tooltip, Avatar, Skeleton, Badge } from '../ui'
import toast from 'react-hot-toast'

const TEAM_COLLAPSE_KEY = 'planning-grid-collapsed-teams'

const isOnLeave = (leaveList, userId, dateStr) => {
  return leaveList.some((l) => {
    if (l.user_id !== userId) return false
    if (l.status !== 'approved') return false
    return dateStr >= l.start_date && dateStr <= l.end_date
  })
}

const getStatusForDay = (planning, pauses, onLeave) => {
  if (onLeave) return { label: 'Congé', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20', dot: 'bg-red-500' }
  if (planning) {
    const hasActivePause = pauses.some((p) => p.status === 'active' || p.is_active)
    if (hasActivePause) return { label: 'Pause', color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/20', dot: 'bg-amber-500' }
    return { label: 'Présent', color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/20', dot: 'bg-emerald-500' }
  }
  return { label: 'Absent', color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-dark-600', dot: 'bg-slate-400' }
}

// ── Sub-components ────────────────────────────────────────────

const DraggableCell = memo(({ planning, pauses, isWeekLocked, onCardClick, onCardDelete, isOnLeaveDay, day }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: String(planning.id) })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  const shiftColor = planning?.shift ? getShiftColor(planning.shift.type) : null
  const isLocked = planning?.is_locked
  const activePause = pauses.find((p) => p.status === 'active' || p.is_active)
  const scheduledPause = pauses.find((p) => p.status === 'scheduled')
  const canModify = !isWeekLocked && !isLocked

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onCardClick?.(planning)}
      className={cn(
        'group relative cursor-grab active:cursor-grabbing rounded-lg border p-2',
        'transition-all duration-100 hover:shadow-sm',
        'h-full flex flex-col justify-between min-h-[56px] touch-none',
        isDragging && 'opacity-40 z-50',
        isOnLeaveDay
          ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/10'
          : shiftColor
            ? [shiftColor.border, shiftColor.bg]
            : 'border-surface-200 bg-white dark:border-dark-500 dark:bg-dark-700',
        isLocked && 'opacity-75',
      )}
    >
      {isLocked && (
        <Lock className="absolute right-1 top-1 h-2.5 w-2.5 text-slate-400" />
      )}

      {activePause && (
        <Coffee className="absolute right-1 top-3.5 h-2.5 w-2.5 text-green-500" />
      )}
      {!activePause && scheduledPause && (
        <Coffee className="absolute right-1 top-3.5 h-2.5 w-2.5 text-slate-400" />
      )}

      <div className="min-w-0 leading-tight">
        <p className={cn(
          'text-xs font-semibold truncate',
          shiftColor?.text || 'text-slate-800 dark:text-slate-100',
          isOnLeaveDay && 'text-red-700 dark:text-red-300',
        )}>
          {planning.shift?.name}
        </p>
        <p className={cn(
          'text-2xs mt-0.5 text-slate-500 dark:text-slate-400',
          isOnLeaveDay && 'text-red-500/70 dark:text-red-400/70',
        )}>
          {planning.shift?.start_time}–{planning.shift?.end_time}
        </p>
      </div>

      <div className="flex items-center gap-1 mt-1">
        {planning.team && (
          <span
            className="h-1.5 w-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: planning.team.color || '#6172f3' }}
          />
        )}
        {planning.shift?.duration_hours > 0 && (
          <span className="text-2xs text-slate-400 dark:text-slate-500">
            {planning.shift.duration_hours}h
          </span>
        )}
      </div>

      {isOnLeaveDay && (
        <AlertTriangle className="absolute bottom-1 right-1 h-2.5 w-2.5 text-red-500" />
      )}

      {canModify && onCardDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onCardDelete(planning)
          }}
          className="absolute -top-1.5 -right-1.5 z-10 flex h-4 w-4 items-center justify-center
                     rounded-full border border-surface-200 bg-white text-red-400
                     opacity-0 shadow-xs transition-all duration-100
                     hover:bg-red-50 hover:text-red-600
                     group-hover:opacity-100
                     dark:border-dark-400 dark:bg-dark-600"
        >
          <Trash2 className="h-2 w-2" />
        </button>
      )}
    </div>
  )
})

const EmptyDroppableCell = memo(({ droppableId, day, isWeekLocked, isOnLeaveDay, onAddClick }) => {
  const { isOver, setNodeRef } = useDroppable({ id: droppableId })

  return (
    <div ref={setNodeRef} className="h-full">
      <Tooltip content={`Ajouter au ${day.label} ${day.dayNum}`}>
        <button
          onClick={() => onAddClick?.(day)}
          disabled={isWeekLocked}
          className={cn(
            'flex h-full min-h-[56px] w-full items-center justify-center',
            'rounded-lg border border-dashed transition-all duration-100',
            isWeekLocked
              ? 'border-surface-100 text-slate-200 cursor-not-allowed dark:border-dark-600 dark:text-dark-500'
              : 'border-surface-200 text-slate-300 hover:border-brand-300 hover:text-brand-500 hover:bg-brand-50 dark:border-dark-500 dark:hover:border-brand-600 dark:hover:bg-brand-900/10',
            isOnLeaveDay && 'border-red-200 dark:border-red-800/30',
            isOver && 'border-brand-400 bg-brand-50 dark:bg-brand-900/10',
          )}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </Tooltip>
    </div>
  )
})

const AssignedDroppableCell = memo(({ children, droppableId }) => {
  const { isOver, setNodeRef } = useDroppable({ id: droppableId })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'h-full rounded-lg transition-colors duration-100',
        isOver && 'ring-2 ring-brand-400 bg-brand-50/50 dark:bg-brand-900/10',
      )}
    >
      {children}
    </div>
  )
})

const DragOverlayContent = ({ planning }) => {
  if (!planning) return null
  const shiftColor = getShiftColor(planning.shift?.type)
  return (
    <div className={cn(
      'rounded-lg border-2 p-2 shadow-lg bg-white dark:bg-dark-700',
      shiftColor?.border || 'border-surface-200',
    )}>
      <p className="text-xs font-semibold">{planning.shift?.name}</p>
      <p className="text-2xs text-slate-400">
        {planning.shift?.start_time}–{planning.shift?.end_time}
      </p>
      {planning.user && (
        <p className="text-2xs text-slate-500 mt-0.5">{planning.user.name}</p>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────

const PlanningGrid = ({
  days = [],
  employees = [],
  onCardClick,
  onCardDelete,
  onAddClick,
  onRefresh,
  className,
}) => {
  const dispatch = useDispatch()
  const planningByDate = useSelector(selectPlanningByDate)
  const plannings = useSelector(selectPlanningData)
  const loading = useSelector(selectPlanningLoading)
  const hasLocked = useSelector(selectHasLockedRecords)
  const pausesByPlanningId = useSelector(selectPausesMap)
  const leaveList = useSelector(selectAdminLeaveList)
  const [activeDragId, setActiveDragId] = useState(null)
  const [collapsedTeams, setCollapsedTeams] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(TEAM_COLLAPSE_KEY) || '{}')
    } catch { return {} }
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const toggleTeam = useCallback((teamId) => {
    setCollapsedTeams((prev) => {
      const next = { ...prev, [teamId]: !prev[teamId] }
      localStorage.setItem(TEAM_COLLAPSE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const employeeDayMap = useMemo(() => {
    const map = {}
    for (const emp of employees) {
      map[emp.id] = {}
      for (const day of days) {
        const dayPlannings = planningByDate[day.date] || []
        const assignment = dayPlannings.find((p) => p.user_id === emp.id)
        if (assignment) {
          map[emp.id][day.date] = assignment
        }
      }
    }
    return map
  }, [employees, days, planningByDate])

  const weeklyHoursMap = useMemo(() => {
    const map = {}
    for (const emp of employees) {
      let total = 0
      for (const day of days) {
        const assignment = employeeDayMap[emp.id]?.[day.date]
        if (assignment?.shift?.duration_hours) {
          total += assignment.shift.duration_hours
        }
      }
      map[emp.id] = total
    }
    return map
  }, [employees, days, employeeDayMap])

  const shiftCountMap = useMemo(() => {
    const map = {}
    for (const emp of employees) {
      let count = 0
      for (const day of days) {
        if (employeeDayMap[emp.id]?.[day.date]) count++
      }
      map[emp.id] = count
    }
    return map
  }, [employees, days, employeeDayMap])

  const leaveDayMap = useMemo(() => {
    const map = {}
    for (const emp of employees) {
      map[emp.id] = {}
      for (const day of days) {
        map[emp.id][day.date] = isOnLeave(leaveList, emp.id, day.date)
      }
    }
    return map
  }, [employees, days, leaveList])

  // Group employees by team (first team; no-team goes to "Sans équipe")
  const teamGroups = useMemo(() => {
    const groups = {}
    const noTeamId = '__none'
    for (const emp of employees) {
      const primaryTeam = emp.teams?.[0]
      if (primaryTeam) {
        if (!groups[primaryTeam.id]) {
          groups[primaryTeam.id] = { team: primaryTeam, employees: [] }
        }
        groups[primaryTeam.id].employees.push(emp)
      } else {
        if (!groups[noTeamId]) {
          groups[noTeamId] = {
            team: { id: noTeamId, name: 'Sans équipe', color: '#94a3b8' },
            employees: [],
          }
        }
        groups[noTeamId].employees.push(emp)
      }
    }
    return Object.values(groups).sort((a, b) => a.team.name.localeCompare(b.team.name))
  }, [employees])

  // Today's date string
  const todayStr = useMemo(() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  }, [])

  // Compute team-level aggregates
  const teamAggregates = useMemo(() => {
    const aggs = {}
    for (const group of teamGroups) {
      const teamId = group.team.id
      let totalHours = 0
      let assignedCount = 0
      let warningCount = 0
      let leaveCount = 0
      let pausedToday = 0

      for (const emp of group.employees) {
        const hours = weeklyHoursMap[emp.id] || 0
        totalHours += hours

        const hasAssignment = days.some((d) => employeeDayMap[emp.id]?.[d.date])
        if (hasAssignment) assignedCount++

        if (hours > 44) warningCount++

        const hasLeave = days.some((d) => leaveDayMap[emp.id]?.[d.date])
        if (hasLeave) leaveCount++

        const todayPlanning = employeeDayMap[emp.id]?.[todayStr]
        if (todayPlanning) {
          const todayPauses = pausesByPlanningId[todayPlanning.id]
          if (todayPauses?.some((p) => p.status === 'active' || p.is_active)) {
            pausedToday++
          }
        }
      }

      const empCount = group.employees.length
      const coveragePct = empCount > 0 ? Math.round((assignedCount / empCount) * 100) : 0

      aggs[teamId] = {
        totalHours: Math.round(totalHours * 10) / 10,
        assignedCount,
        empCount,
        coveragePct,
        warningCount,
        leaveCount,
        pausedToday,
        missingCount: empCount - assignedCount,
      }
    }
    return aggs
  }, [teamGroups, weeklyHoursMap, days, employeeDayMap, leaveDayMap, pausesByPlanningId, todayStr])

  const handleDragStart = useCallback((event) => {
    setActiveDragId(event.active.id)
    dispatch(clearConflictErrors())
  }, [dispatch])

  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event
    setActiveDragId(null)

    if (!over || active.id === over.id) return

    const planningId = Number(active.id)
    const targetId = String(over.id)

    const planning = plannings.find((p) => p.id === planningId)
    if (!planning) return

    if (planning.is_locked) {
      toast.error('Ce planning est verrouillé')
      return
    }

    const [targetDate, targetEmployeeIdStr] = targetId.split('__')
    const targetEmployeeId = Number(targetEmployeeIdStr)

    if (planning.date === targetDate && planning.user_id === targetEmployeeId) return

    const updateData = {
      user_id: targetEmployeeId || planning.user_id,
      shift_id: planning.shift_id,
      date: targetDate || planning.date,
      team_id: planning.team_id || undefined,
      notes: planning.notes || undefined,
    }

    const result = await dispatch(updatePlanningThunk({
      id: planningId,
      data: updateData,
    }))

    if (updatePlanningThunk.fulfilled.match(result)) {
      toast.success('Assignation déplacée')
      onRefresh?.()
    }
  }, [dispatch, plannings, onRefresh])

  const handleDragCancel = useCallback(() => {
    setActiveDragId(null)
  }, [])

  const activeDragPlanning = useMemo(() => {
    if (!activeDragId) return null
    return plannings.find((p) => p.id === Number(activeDragId))
  }, [activeDragId, plannings])

  const handleAddClick = useCallback((day) => {
    onAddClick?.(day)
  }, [onAddClick])

  const handleCardClick = useCallback((planning) => {
    onCardClick?.(planning)
  }, [onCardClick])

  const handleCardDelete = useCallback((planning) => {
    onCardDelete?.(planning)
  }, [onCardDelete])

  const EMPL_WIDTH = 220
  const totalWidth = EMPL_WIDTH + days.length * 130

  // ── Loading state ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Skeleton.Block className="h-10 w-40 rounded-lg" />
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton.Block key={i} className="h-10 flex-1 rounded-lg" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <Skeleton.Block className="h-14 w-40 rounded-lg" />
            {Array.from({ length: 7 }).map((_, j) => (
              <Skeleton.Block key={j} className="h-14 flex-1 rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  // ── Empty state ─────────────────────────────────────────────
  if (!employees.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-200 py-12 dark:border-dark-500">
        <Users className="mb-2 h-8 w-8 text-slate-300" />
        <p className="text-sm text-slate-400">Aucun employé actif</p>
      </div>
    )
  }

  // ── Team section ────────────────────────────────────────────
  const TeamSection = ({ group, rowOffset }) => {
    const teamId = group.team.id
    const isCollapsed = !!collapsedTeams[teamId]
    const agg = teamAggregates[teamId]
    let localRowIndex = 0

    return (
      <div className="contents">
        {/* Team header — spans all columns */}
        <div
          className={cn(
            'sticky left-0 z-10 flex items-center gap-2 px-3 py-2 border-b border-r cursor-pointer',
            'bg-surface-100 dark:bg-dark-700',
            'border-surface-200 dark:border-dark-500',
          )}
          style={{ width: EMPL_WIDTH }}
          onClick={() => toggleTeam(teamId)}
        >
          <button className="flex-shrink-0 text-slate-400 hover:text-slate-600">
            {isCollapsed
              ? <ChevronRight className="h-3.5 w-3.5" />
              : <ChevronDown className="h-3.5 w-3.5" />
            }
          </button>
          <span
            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: group.team.color || '#6172f3' }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
              {group.team.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Users className="h-2.5 w-2.5 text-slate-400" />
              <span className="text-2xs text-slate-400">{agg.empCount}</span>
              <span className="text-2xs text-slate-300">·</span>
              <Clock className="h-2.5 w-2.5 text-slate-400" />
              <span className="text-2xs text-slate-400">{agg.totalHours}h</span>
              <span className="text-2xs text-slate-300">·</span>
              <span className={cn(
                'text-2xs font-medium',
                agg.coveragePct >= 80 ? 'text-emerald-500' : agg.coveragePct >= 50 ? 'text-amber-500' : 'text-red-500',
              )}>
                {agg.coveragePct}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {agg.warningCount > 0 && (
              <Tooltip content={`${agg.warningCount} avertissement(s)`}>
                <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-2xs font-bold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  {agg.warningCount}
                </span>
              </Tooltip>
            )}
            {agg.leaveCount > 0 && (
              <Tooltip content={`${agg.leaveCount} en congé`}>
                <span className="flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-2xs font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  {agg.leaveCount}
                </span>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Team header day cells (merged) */}
        <div
          className={cn(
            'col-span-7 flex items-center px-3 py-2 border-b cursor-pointer',
            'bg-surface-100 dark:bg-dark-700',
            'border-surface-200 dark:border-dark-500',
          )}
          onClick={() => toggleTeam(teamId)}
        >
          <div className="flex items-center gap-3 text-2xs text-slate-400">
            <span>
              <span className="font-medium text-slate-500">{agg.assignedCount}</span>
              /{agg.empCount} planifiés
            </span>
            {agg.missingCount > 0 && (
              <span className="text-amber-500">
                {agg.missingCount} manquant(s)
              </span>
            )}
            {agg.leaveCount > 0 && (
              <span className="text-red-400">
                {agg.leaveCount} en congé
              </span>
            )}
            {agg.pausedToday > 0 && (
              <span className="text-amber-400">
                <Coffee className="inline h-2.5 w-2.5 mr-0.5" />
                {agg.pausedToday} en pause
              </span>
            )}
          </div>
        </div>

        {/* Employee rows */}
        {!isCollapsed && group.employees.map((emp) => {
          const rowIdx = localRowIndex++
          const weeklyHours = weeklyHoursMap[emp.id] || 0
          const shiftCount = shiftCountMap[emp.id] || 0
          const isOvertime = weeklyHours > 44
          const rating = emp.ratings?.[0]?.score

          // Determine today's status
          const todayPlanning = employeeDayMap[emp.id]?.[todayStr]
          const todayPauses = todayPlanning ? (pausesByPlanningId[todayPlanning.id] || []) : []
          const todayLeave = leaveDayMap[emp.id]?.[todayStr]
          const status = getStatusForDay(todayPlanning, todayPauses, todayLeave)

          return (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: rowIdx * 0.01 }}
              className="contents"
            >
              {/* Employee label column */}
              <div
                className={cn(
                  'sticky left-0 z-10 flex items-center gap-2 px-3 py-1.5 border-b border-r',
                  'bg-white dark:bg-dark-700',
                  'border-surface-100 dark:border-dark-600',
                  'min-h-[64px]',
                )}
                style={{ width: EMPL_WIDTH }}
              >
                <Avatar
                  src={emp.avatar_url}
                  name={emp.name}
                  size="xs"
                  ring={isOvertime}
                  ringColor={isOvertime ? 'ring-red-400' : undefined}
                />
                <div className="min-w-0 leading-tight flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-100 truncate">
                      {emp.name}
                    </p>
                    {emp.role === 'employee' && (
                      <Briefcase className="h-2.5 w-2.5 text-slate-300 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className={cn(
                      'inline-flex items-center gap-0.5 text-2xs',
                      status.color,
                    )}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
                      {status.label}
                    </span>
                    <Clock className="h-2.5 w-2.5 text-slate-400" />
                    <span className={cn(
                      'text-2xs',
                      isOvertime ? 'text-red-500 font-semibold' : 'text-slate-400',
                    )}>
                      {weeklyHours}h
                    </span>
                    {shiftCount > 0 && (
                      <span className="text-2xs text-slate-400">
                        · {shiftCount}j
                      </span>
                    )}
                    {rating && (
                      <span className="inline-flex items-center gap-0.5 text-2xs text-amber-500">
                        <Star className="h-2.5 w-2.5 fill-amber-400" />
                        {rating}
                      </span>
                    )}
                    {isOvertime && (
                      <AlertTriangle className="h-2.5 w-2.5 text-red-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Day cells */}
              {days.map((day) => {
                const planning = employeeDayMap[emp.id]?.[day.date] || null
                const pauses = planning ? (pausesByPlanningId[planning.id] || []) : []
                const onLeave = leaveDayMap[emp.id]?.[day.date] || false
                const droppableId = `${day.date}__${emp.id}`

                return (
                  <div
                    key={day.date}
                    className={cn(
                      'border-b border-r p-1',
                      'border-surface-100 dark:border-dark-600',
                      'min-h-[64px]',
                      day.isWeekend && !planning && 'bg-surface-50/50 dark:bg-dark-800/40',
                    )}
                  >
                    {planning ? (
                      <AssignedDroppableCell droppableId={droppableId}>
                        <DraggableCell
                          planning={planning}
                          pauses={pauses}
                          isWeekLocked={hasLocked}
                          onCardClick={handleCardClick}
                          onCardDelete={handleCardDelete}
                          isOnLeaveDay={onLeave}
                          day={day}
                        />
                      </AssignedDroppableCell>
                    ) : (
                      <EmptyDroppableCell
                        droppableId={droppableId}
                        day={day}
                        isWeekLocked={hasLocked}
                        isOnLeaveDay={onLeave}
                        onAddClick={handleAddClick}
                      />
                    )}
                  </div>
                )
              })}
            </motion.div>
          )
        })}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn('overflow-auto pb-4', className)}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `${EMPL_WIDTH}px repeat(${days.length}, 1fr)`,
            minWidth: totalWidth,
          }}
        >
          {/* ── Header row ────────────────────────────────── */}
          <div
            className={cn(
              'sticky top-0 z-20 flex items-center gap-2 px-3 py-2.5 rounded-tl-xl',
              'bg-surface-50 border-b border-r border-surface-200 dark:bg-dark-800 dark:border-dark-600',
            )}
          >
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
              Équipes
            </span>
          </div>

          {days.map((day) => (
            <div
              key={day.date}
              className={cn(
                'sticky top-0 z-20 flex flex-col items-center justify-center px-1 py-2 border-b',
                day.isToday
                  ? 'bg-brand-500 text-white'
                  : day.isWeekend
                    ? 'bg-surface-100 text-slate-400 dark:bg-dark-700 dark:text-slate-500'
                    : 'bg-surface-50 text-slate-600 dark:bg-dark-800 dark:text-slate-300',
                'border-surface-200 dark:border-dark-600',
              )}
            >
              <span className="text-2xs font-semibold uppercase tracking-wider leading-none">
                {day.label}
              </span>
              <span className={cn(
                'text-base font-bold leading-tight mt-0.5',
                day.isToday ? 'text-white' : 'text-slate-800 dark:text-slate-100',
              )}>
                {day.dayNum}
              </span>
              <span className={cn(
                'text-2xs leading-none mt-0.5',
                day.isToday ? 'text-white/70' : 'text-slate-400',
              )}>
                {day.month}
              </span>
            </div>
          ))}

          {/* ── Team sections ─────────────────────────────── */}
          {teamGroups.map((group, i) => (
            <TeamSection key={group.team.id} group={group} rowOffset={i} />
          ))}
        </div>
      </motion.div>

      <DragOverlay>
        {activeDragPlanning ? (
          <DragOverlayContent planning={activeDragPlanning} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default PlanningGrid