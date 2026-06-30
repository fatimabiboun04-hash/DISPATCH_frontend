import { useState, useEffect, useCallback, useRef } from 'react'
import { useDispatch, useSelector }                  from 'react-redux'
import { getISOWeek, getISOWeekYear }                from 'date-fns'
import { motion, AnimatePresence }                   from 'framer-motion'
import { usePlanning }                               from '../../hooks/usePlanning'
import { fetchPlanningThunk, deletePlanningThunk, createPlanningThunk } from '../../features/planning/planningThunks'
import { selectPlanningFilters, selectPlanningError } from '../../features/planning/planningSelectors'
import { selectTeamList } from '../../features/teams/teamSelectors'
import { fetchTeamsThunk }   from '../../features/teams/teamThunks'
import { fetchShiftsThunk }  from '../../features/shifts/shiftThunks'
import { fetchPlanningStatsThunk } from '../../features/planning/planningStatsSlice'
import { selectStatsData } from '../../features/planning/planningStatsSelectors'
import { fetchStatsThunk, fetchCoverageThunk, fetchActivePausesThunk } from '../../features/dashboard/dashboardThunks'
import { fetchNotificationsThunk, fetchUnreadCountThunk } from '../../features/notifications/notificationThunks'
import PlanningToolbar       from '../../components/planning/PlanningToolbar'
import PlanningFilters       from '../../components/planning/PlanningFilters'
import PlanningGrid          from '../../components/planning/PlanningGrid'
import PlanningLockBanner    from '../../components/planning/PlanningLockBanner'
import ConflictBanner        from '../../components/planning/ConflictBanner'
import PlanningDrawer        from '../../components/planning/PlanningDrawer'
import QuickAddPlanningModal from '../../components/planning/QuickAddPlanningModal'
import PauseFormModal        from '../../components/planning/PauseFormModal'
import BatchToolbar          from '../../components/planning/BatchToolbar'
import WeeklySummary         from '../../components/planning/WeeklySummary'
import SandboxPanel          from '../../components/planning/SandboxPanel'
import { ErrorState, ConfirmDialog } from '../../components/ui'
import { Calendar, Coffee } from 'lucide-react'
import axiosInstance         from '../../services/axiosInstance'
import { API }               from '../../constants/apiRoutes'
import toast                 from 'react-hot-toast'

const PlanningPage = () => {
  const dispatch = useDispatch()
  const filters  = useSelector(selectPlanningFilters)
  const error    = useSelector(selectPlanningError)

  const [weekDate, setWeekDate] = useState(new Date())

  const {
    days,
    weekNum,
    year,
    weekLabel,
    goToNextWeek,
    goToPrevWeek,
    goToCurrentWeek,
    fetchWeek,
  } = usePlanning(weekDate, setWeekDate)

  // Drawer state
  const [drawerOpen,    setDrawerOpen]    = useState(false)
  const [drawerPlanning,setDrawerPlanning]= useState(null)

  // Quick add modal state
  const [addOpen,    setAddOpen]    = useState(false)
  const [addDate,    setAddDate]    = useState(null)

  // Add menu popover state
  const [addMenuDay, setAddMenuDay] = useState(null)
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const addMenuRef = useRef(null)

  // Pause modal state
  const [pauseOpen,    setPauseOpen]    = useState(false)
  const [pauseDate,    setPauseDate]    = useState(null)
  const [pauseEmps,    setPauseEmps]    = useState([])
  const [pausePlanningId, setPausePlanningId] = useState(null)

  // Delete from grid (without drawer)
  const [deleteTarget,   setDeleteTarget]   = useState(null)
  const [deleting,       setDeleting]       = useState(false)

  // Clipboard for copy/paste
  const [clipboardPlanning, setClipboardPlanning] = useState(null)

  // Dropdown data for modals
  const [employees, setEmployees] = useState([])
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const employeesAbortRef = useRef(null)

  const reduxTeams = useSelector(selectTeamList)
  const stats = useSelector(selectStatsData)

  const fetchStats = useCallback(() => {
    dispatch(fetchPlanningStatsThunk({ week_number: weekNum, year }))
  }, [dispatch, weekNum, year])

  const fetchEmployees = useCallback(async () => {
    if (employeesAbortRef.current) {
      employeesAbortRef.current.abort()
    }
    const controller = new AbortController()
    employeesAbortRef.current = controller
    setEmployeesLoading(true)
    try {
      const empRes = await axiosInstance.get(API.EMPLOYEES.LIST, {
        params: { per_page: 200, status: 'active' },
        signal: controller.signal,
      })
      if (!controller.signal.aborted) {
        setEmployees(empRes.data.data || [])
      }
    } catch (err) {
      if (err.name !== 'CanceledError' && !controller.signal.aborted) {
        toast.error('Impossible de charger les employés')
        setEmployees([])
      }
    } finally {
      if (!controller.signal.aborted) {
        setEmployeesLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    dispatch(fetchShiftsThunk())
    if (reduxTeams.length === 0) {
      dispatch(fetchTeamsThunk({}))
    }
    fetchWeek(weekDate, filters)
    fetchEmployees()
    return () => {
      if (employeesAbortRef.current) {
        employeesAbortRef.current.abort()
      }
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    if (weekNum && year) {
      fetchStats()
    }
  }, [weekNum, year, fetchStats])

  const refetchWithFilters = useCallback(() => {
    const params = {
      week_number: weekNum,
      year,
      team_id:  filters.team_id  || undefined,
      shift_id: filters.shift_id || undefined,
      user_id:  filters.user_id  || undefined,
      skill_id: filters.skill_id || undefined,
      search:   filters.search   || undefined,
    }
    if (filters.status === 'locked') params.is_locked = true
    if (filters.status === 'unlocked') params.is_locked = false
    dispatch(fetchPlanningThunk(params))
  }, [dispatch, weekNum, year, filters])

  const refreshDashboard = useCallback(() => {
    dispatch(fetchStatsThunk())
    dispatch(fetchCoverageThunk())
    dispatch(fetchActivePausesThunk())
  }, [dispatch])

  const refreshNotifications = useCallback(() => {
    dispatch(fetchNotificationsThunk())
    dispatch(fetchUnreadCountThunk())
  }, [dispatch])

  const handleRefresh = useCallback(() => {
    fetchWeek(weekDate, filters)
    fetchStats()
    fetchEmployees()
    refreshDashboard()
    refreshNotifications()
  }, [fetchWeek, weekDate, filters, fetchStats, fetchEmployees, refreshDashboard, refreshNotifications])

  const handleCardClick = (planning) => {
    setDrawerPlanning(planning)
    setDrawerOpen(true)
  }

  const handleCardDelete = (planning) => {
    setDeleteTarget(planning)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await dispatch(deletePlanningThunk(deleteTarget.id))
    setDeleting(false)
    if (deletePlanningThunk.fulfilled.match(result)) {
      toast.success('Assignation supprimée')
      setDeleteTarget(null)
      handleRefresh()
    } else {
      toast.error('Erreur lors de la suppression')
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault()
        const today = days.find((d) => d.isToday) || days[3] || days[0]
        if (today) handleAddClick(today)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [days])

  // Close add menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target)) {
        setAddMenuOpen(false)
      }
    }
    if (addMenuOpen) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [addMenuOpen])

  const handleAddClick = (day) => {
    setAddMenuDay(day)
    setAddMenuOpen(true)
  }

  const handleAddAssignment = () => {
    if (!addMenuDay) return
    setAddDate(addMenuDay.date)
    setAddOpen(true)
    setAddMenuOpen(false)
  }

  const handlePasteAssignment = useCallback(async (targetDate) => {
    if (!clipboardPlanning) return
    const result = await dispatch(createPlanningThunk({
      user_id:  clipboardPlanning.user_id,
      shift_id: clipboardPlanning.shift_id,
      date:     targetDate,
      team_id:  clipboardPlanning.team_id || undefined,
      notes:    clipboardPlanning.notes || undefined,
    }))
    if (createPlanningThunk.fulfilled.match(result)) {
      toast.success('Assignation collée')
      handleRefresh()
    }
  }, [clipboardPlanning, dispatch, handleRefresh])

  const handleAddPause = () => {
    if (!addMenuDay) return
    setPauseDate(addMenuDay.date)
    setPauseEmps(employees)
    setPausePlanningId(null)
    setPauseOpen(true)
    setAddMenuOpen(false)
  }

  const isCurrentWeek =
    getISOWeek(weekDate)     === getISOWeek(new Date()) &&
    getISOWeekYear(weekDate) === getISOWeekYear(new Date())

  if (error) {
    return <ErrorState message={error} onRetry={handleRefresh} />
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Planning hebdomadaire
        </h1>
        <p className="mt-0.5 text-sm text-slate-400">
          Gérez les assignations des équipes
        </p>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PlanningToolbar
          weekLabel={weekLabel}
          onPrev={goToPrevWeek}
          onNext={goToNextWeek}
          onToday={goToCurrentWeek}
          isCurrentWeek={isCurrentWeek}
          onRefresh={handleRefresh}
          weekNumber={weekNum}
          year={year}
        />
      </motion.div>

      {/* Weekly summary — always visible */}
      <WeeklySummary
        weekNumber={weekNum}
        year={year}
        stats={stats}
      />

      {/* Conflict banner */}
      <ConflictBanner />

      {/* Lock banner */}
      <PlanningLockBanner />

      {/* Filters */}
      <PlanningFilters
        employees={employees}
        onFiltersChange={refetchWithFilters}
      />

      {/* Sandbox preview */}
      <SandboxPanel
        weekNumber={weekNum}
        year={year}
        onRefresh={handleRefresh}
      />

      {/* Batch operations toolbar */}
      <BatchToolbar
        employees={employees}
        onRefresh={handleRefresh}
      />

      {/* Weekly scheduling grid */}
      <PlanningGrid
        days={days}
        employees={employees}
        onCardClick={handleCardClick}
        onCardDelete={handleCardDelete}
        onAddClick={handleAddClick}
        onRefresh={handleRefresh}
        clipboardPlanning={clipboardPlanning}
        onCopyClick={setClipboardPlanning}
        onPasteClick={handlePasteAssignment}
      />

      {/* Planning drawer */}
      <PlanningDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        planning={drawerPlanning}
        onDeleted={() => {
          setDrawerOpen(false)
          handleRefresh()
        }}
        onRefresh={handleRefresh}
      />

      {/* Add menu popover — positioned next to the grid */}
      <AnimatePresence>
        {addMenuOpen && addMenuDay && (
          <motion.div
            ref={addMenuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                       w-56 rounded-xl border border-surface-200 bg-white p-2 shadow-xl
                       dark:border-dark-500 dark:bg-dark-700"
          >
            <p className="px-2 py-1.5 text-2xs font-semibold uppercase tracking-wider text-slate-400">
              Ajouter pour {addMenuDay.label} {addMenuDay.dayNum}
            </p>
            <div className="mt-1 space-y-0.5">
              <button
                onClick={handleAddAssignment}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm
                           text-slate-700 hover:bg-brand-50 hover:text-brand-600
                           dark:text-slate-200 dark:hover:bg-brand-900/20 dark:hover:text-brand-400"
              >
                <Calendar className="h-4 w-4" />
                Assignation planning
              </button>

              <button
                onClick={handleAddPause}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm
                           text-slate-700 hover:bg-brand-50 hover:text-brand-600
                           dark:text-slate-200 dark:hover:bg-brand-900/20 dark:hover:text-brand-400"
              >
                <Coffee className="h-4 w-4" />
                Pause
              </button>
            </div>
            <div className="mt-2 border-t border-surface-100 pt-1.5 dark:border-dark-500">
              <button
                onClick={() => setAddMenuOpen(false)}
                className="w-full rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:bg-surface-50 dark:hover:bg-dark-600"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick add: planning assignment modal */}
      <QuickAddPlanningModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        date={addDate}
        employees={employees}
        teams={reduxTeams}
        defaultTeamId={filters.team_id}
        onSuccess={handleRefresh}
        weekNumber={weekNum}
        year={year}
      />

      {/* Quick add: pause modal */}
      <PauseFormModal
        open={pauseOpen}
        onClose={() => setPauseOpen(false)}
        planningId={pausePlanningId}
        users={pauseEmps}
        teams={reduxTeams}
        shiftStart="06:00"
        shiftEnd="22:00"
        onSuccess={handleRefresh}
      />

      {/* Delete confirmation (from grid row button) */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Supprimer l'assignation"
        description={`Supprimer l'assignation de ${deleteTarget?.user?.name || 'cet employé'} pour le ${deleteTarget?.date} ?`}
      />
    </div>
  )
}

export default PlanningPage