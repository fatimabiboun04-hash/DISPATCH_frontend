import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setFilters, resetFilters } from '../../features/planning/planningSlice'
import { selectPlanningFilters }    from '../../features/planning/planningSelectors'
import { selectTeamList } from '../../features/teams/teamSelectors'
import { selectActiveShifts }       from '../../features/shifts/shiftSelectors'
import { selectSkills }             from '../../features/skills/skillSelectors'
import { FilterBar, Select, Button, SearchInput } from '../ui'
import { X } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'locked', label: 'Verrouillé' },
  { value: 'unlocked', label: 'Déverrouillé' },
]

const PlanningFilters = ({ employees = [], onFiltersChange }) => {
  const dispatch = useDispatch()
  const filters  = useSelector(selectPlanningFilters)
  const teams    = useSelector(selectTeamList)
  const shifts   = useSelector(selectActiveShifts)
  const skills   = useSelector(selectSkills)
  const searchTimer = useRef(null)

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

  const skillOptions = [
    { value: '', label: 'Toutes les compétences' },
    ...skills.map((s) => ({ value: String(s.id), label: s.name })),
  ]

  const handleChange = (key, value) => {
    dispatch(setFilters({ [key]: value }))
    onFiltersChange?.()
  }

  const handleSearch = (value) => {
    dispatch(setFilters({ search: value }))
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => onFiltersChange?.(), 300)
  }

  useEffect(() => {
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [])

  const hasActive = filters.team_id || filters.shift_id || filters.user_id || filters.skill_id || filters.status || filters.search

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
      <SearchInput
        value={filters.search}
        onChange={handleSearch}
        placeholder="Rechercher employé, shift…"
        size="sm"
        className="w-48"
      />
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
      <Select
        options={skillOptions}
        value={filters.skill_id}
        onChange={(e) => handleChange('skill_id', e.target.value)}
        className="w-44"
        size="sm"
      />
      <Select
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(e) => handleChange('status', e.target.value)}
        className="w-36"
        size="sm"
      />
    </FilterBar>
  )
}

export default PlanningFilters
