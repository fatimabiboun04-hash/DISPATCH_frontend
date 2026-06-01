import { useDispatch, useSelector } from 'react-redux'
import { useSelector as useSel }    from 'react-redux'
import { setFilters, resetFilters } from '../../features/planning/planningSlice'
import { selectPlanningFilters }    from '../../features/planning/planningSelectors'
import { selectTeamList } from '../../features/teams/teamSelectors'
import { selectActiveShifts }       from '../../features/shifts/shiftSelectors'
import { FilterBar, Select, Button } from '../ui'
import { X } from 'lucide-react'

/**
 * PlanningFilters — team + shift + employee filters.
 * Dispatches setFilters — parent page re-fetches on change.
 *
 * Teams from Redux (already fetched in TeamsPage or on mount).
 * Shifts from Redux (already fetched in ShiftsPage or on mount).
 */
const PlanningFilters = ({ employees = [], onFiltersChange }) => {
  const dispatch = useDispatch()
  const filters  = useSelector(selectPlanningFilters)
  const teams = useSel(selectTeamList) // from teamSlice — gap fix #7 (shared auth)
  const shifts   = useSel(selectActiveShifts)

  const teamOptions = [
    { value: '', label: 'Toutes les équipes' },
    ...teams.map((t) => ({ value: String(t.id), label: t.name })),
  ]

  const shiftOptions = [
    { value: '', label: 'Tous les shifts' },
    ...shifts.map((s) => ({ value: String(s.id), label: s.name })),
  ]

  const employeeOptions = [
    { value: '', label: 'Tous les employés' },
    ...employees.map((e) => ({ value: String(e.id), label: e.name })),
  ]

  const handleChange = (key, value) => {
    dispatch(setFilters({ [key]: value }))
    onFiltersChange?.()
  }

  const hasActive = filters.team_id || filters.shift_id || filters.user_id

  return (
    <FilterBar
      actions={
        hasActive && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<X className="h-3.5 w-3.5" />}
            onClick={() => {
              dispatch(resetFilters())
              onFiltersChange?.()
            }}
          >
            Effacer
          </Button>
        )
      }
    >
      <Select
        options={teamOptions}
        value={filters.team_id}
        onChange={(e) => handleChange('team_id', e.target.value)}
        className="w-40"
        size="sm"
      />
      <Select
        options={shiftOptions}
        value={filters.shift_id}
        onChange={(e) => handleChange('shift_id', e.target.value)}
        className="w-40"
        size="sm"
      />
      {employees.length > 0 && (
        <Select
          options={employeeOptions}
          value={filters.user_id}
          onChange={(e) => handleChange('user_id', e.target.value)}
          className="w-44"
          size="sm"
        />
      )}
    </FilterBar>
  )
}

export default PlanningFilters