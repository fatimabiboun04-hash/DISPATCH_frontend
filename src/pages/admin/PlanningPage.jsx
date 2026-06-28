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
import PlanningToolbar       from '../../components/planning/PlanningToolbar'
import PlanningFilters       from '../../components/planning/PlanningFilters'
import PlanningGrid          from '../../components/planning/PlanningGrid'
import PlanningLockBanner    from '../../components/planning/PlanningLockBanner'
import ConflictBanner        from '../../components/planning/ConflictBanner'
import PlanningDrawer        from '../../components/planning/PlanningDrawer'
import QuickAddPlanningModal from '../../components/planning/QuickAddPlanningModal'
import BatchToolbar          from '../../components/planning/BatchToolbar'
import StatisticsPanel       from '../../components/planning/StatisticsPanel'
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

  // Statistics panel
  const [statsOpen, setStatsOpen] = useState(false)

  // Dropdown data for modals
  const [employees, setEmployees] = useState([])

  const reduxTeams = useSelector(selectTeamList)

  useEffect(() => {
    dispatch(fetchShiftsThunk())
    if (reduxTeams.length === 0) {
      dispatch(fetchTeamsThunk({}))
    }
    fetchWeek(weekDate, filters)
  }, []) // eslint-disable-line

  const refetchWithFilters = useCallback(() => {
    dispatch(fetchPlanningThunk({
      week_number: weekNum,
      year,
      team_id:  filters.team_id  || undefined,
      shift_id: filters.shift_id || undefined,
      user_id:  filters.user_id  || undefined,
    }))
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

  const handleRefresh = () => fetchWeek(weekDate, filters)

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
    <div className="flex flex-col gap-4">

      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Planning hebdomadaire
        </h1>
        <p className="mt-0.5 text-sm text-slate-400">
          Gérez les assignations des équipes
        </p>
      </div>

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
          onStatsToggle={() => setStatsOpen((s) => !s)}
          statsOpen={statsOpen}
        />
      </motion.div>

      {/* Conflict banner */}
      <ConflictBanner />

      {/* Lock banner */}
      <PlanningLockBanner />

      {/* Filters */}
      <PlanningFilters
        employees={employees}
        onFiltersChange={refetchWithFilters}
      />

      {/* Statistics panel */}
      <StatisticsPanel
        weekNumber={weekNum}
        year={year}
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
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