import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector }          from 'react-redux'
import { getISOWeek, getISOWeekYear }        from 'date-fns'
import { motion }                            from 'framer-motion'
import { usePlanning }                       from '../../hooks/usePlanning'
import { fetchPlanningThunk, deletePlanningThunk } from '../../features/planning/planningThunks'
import { selectPlanningFilters, selectPlanningError } from '../../features/planning/planningSelectors'
import { selectTeamList } from '../../features/teams/teamSelectors'
import { fetchTeamsThunk }   from '../../features/teams/teamThunks'
import { fetchShiftsThunk }  from '../../features/shifts/shiftThunks'
import { fetchPlanningStatsThunk } from '../../features/planning/planningStatsSlice'
import { selectStatsData } from '../../features/planning/planningStatsSelectors'
import PlanningToolbar       from '../../components/planning/PlanningToolbar'
import PlanningFilters       from '../../components/planning/PlanningFilters'
import PlanningGrid          from '../../components/planning/PlanningGrid'
import PlanningLockBanner    from '../../components/planning/PlanningLockBanner'
import ConflictBanner        from '../../components/planning/ConflictBanner'
import PlanningDrawer        from '../../components/planning/PlanningDrawer'
import QuickAddPlanningModal from '../../components/planning/QuickAddPlanningModal'
import BatchToolbar          from '../../components/planning/BatchToolbar'
import WeeklySummary         from '../../components/planning/WeeklySummary'
import SandboxPanel          from '../../components/planning/SandboxPanel'
import { ErrorState, ConfirmDialog } from '../../components/ui'
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
  const [addOpen,  setAddOpen]  = useState(false)
  const [addDate,  setAddDate]  = useState(null)

  // Delete from grid (without drawer)
  const [deleteTarget,   setDeleteTarget]   = useState(null)
  const [deleting,       setDeleting]       = useState(false)

  // Dropdown data for modals
  const [employees, setEmployees] = useState([])

  const reduxTeams = useSelector(selectTeamList)
  const stats = useSelector(selectStatsData)

  const fetchStats = useCallback(() => {
    dispatch(fetchPlanningStatsThunk({ week_number: weekNum, year }))
  }, [dispatch, weekNum, year])

  useEffect(() => {
    dispatch(fetchShiftsThunk())
    if (reduxTeams.length === 0) {
      dispatch(fetchTeamsThunk({}))
    }
    fetchWeek(weekDate, filters)
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

  useEffect(() => {
    const abortController = new AbortController()
    const fetchMeta = async () => {
      try {
        const empRes = await axiosInstance.get(API.EMPLOYEES.LIST, {
          params: { per_page: 200, status: 'active' },
          signal: abortController.signal,
        })
        if (!abortController.signal.aborted) {
          setEmployees(empRes.data.data || [])
        }
      } catch (err) {
        if (err.name !== 'CanceledError' && !abortController.signal.aborted) {
          toast.error('Impossible de charger les employés')
          setEmployees([])
        }
      }
    }
    fetchMeta()
    return () => abortController.abort()
  }, [])

  const handleRefresh = () => {
    fetchWeek(weekDate, filters)
    fetchStats()
  }

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

  const handleAddClick = (day) => {
    setAddDate(day.date)
    setAddOpen(true)
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

      {/* Weekly grid with DnD */}
      <PlanningGrid
        days={days}
        onCardClick={handleCardClick}
        onCardDelete={handleCardDelete}
        onAddClick={handleAddClick}
        onRefresh={handleRefresh}
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

      {/* Quick add modal */}
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