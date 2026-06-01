import { useDispatch, useSelector } from 'react-redux'
import { setFilters, resetFilters } from '../../features/employees/employeeSlice'
import { selectEmployeeFilters } from '../../features/employees/employeeSelectors'
import { FilterBar, SearchInput, Select, Button } from '../ui'
import { UserPlus, X } from 'lucide-react'
import { useCallback } from 'react'

const STATUS_OPTIONS = [
  { value: '',          label: 'Tous les statuts' },
  { value: 'active',    label: 'Actif' },
  { value: 'suspended', label: 'Suspendu' },
]

/**
 * EmployeeFilters — search + team + status filters for the employees table.
 * Dispatches setFilters on every change.
 * Parent page calls fetchEmployees when filters change.
 *
 * teams prop: [{ value: id, label: name }]
 */
const EmployeeFilters = ({ teams = [], onAddEmployee }) => {
  const dispatch = useDispatch()
  const filters  = useSelector(selectEmployeeFilters)

  const handleSearch  = useCallback(
    (val) => dispatch(setFilters({ search: val, page: 1 })),
    [dispatch]
  )
  const handleTeam    = (e) => dispatch(setFilters({ team_id: e.target.value, page: 1 }))
  const handleStatus  = (e) => dispatch(setFilters({ status: e.target.value, page: 1 }))
  const handleReset   = () => dispatch(resetFilters())

  const hasActiveFilters = filters.search || filters.team_id || filters.status

  const teamOptions = [
    { value: '', label: 'Toutes les équipes' },
    ...teams,
  ]

  return (
    <FilterBar
      actions={
        <>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<X className="h-3.5 w-3.5" />}
              onClick={handleReset}
            >
              Effacer
            </Button>
          )}
          {onAddEmployee && (
            <Button
              size="sm"
              leftIcon={<UserPlus className="h-4 w-4" />}
              onClick={onAddEmployee}
            >
              Nouvel employé
            </Button>
          )}
        </>
      }
    >
      <SearchInput
        value={filters.search}
        onChange={handleSearch}
        onClear={() => handleSearch('')}
        placeholder="Rechercher par nom ou email…"
        className="w-64"
      />
      <Select
        options={teamOptions}
        value={filters.team_id}
        onChange={handleTeam}
        className="w-44"
        size="sm"
      />
      <Select
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={handleStatus}
        className="w-36"
        size="sm"
      />
    </FilterBar>
  )
}

export default EmployeeFilters