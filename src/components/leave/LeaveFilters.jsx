import { useDispatch, useSelector } from 'react-redux'
import { setAdminFilters, resetAdminFilters } from '../../features/leave/leaveSlice'
import { selectAdminLeaveFilters }            from '../../features/leave/leaveSelectors'
import { FilterBar, Select, Button }          from '../ui'
import { X } from 'lucide-react'

/**
 * LeaveFilters — status + user filters for admin leave request table.
 * Backend index() supports: status, user_id
 */
const STATUS_OPTIONS = [
  { value: '',         label: 'Tous les statuts' },
  { value: 'pending',  label: '⏳ En attente'    },
  { value: 'approved', label: '✅ Approuvés'     },
  { value: 'rejected', label: '❌ Refusés'       },
]

const LeaveFilters = ({ employees = [], onFiltersChange }) => {
  const dispatch = useDispatch()
  const filters  = useSelector(selectAdminLeaveFilters)

  const employeeOptions = [
    { value: '', label: 'Tous les employés' },
    ...employees.map((e) => ({ value: String(e.id), label: e.name })),
  ]

  const handleChange = (key, val) => {
    dispatch(setAdminFilters({ [key]: val }))
    onFiltersChange?.()
  }

  const hasActive = filters.status || filters.user_id

  return (
    <FilterBar
      actions={
        hasActive && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<X className="h-3.5 w-3.5" />}
            onClick={() => {
              dispatch(resetAdminFilters())
              onFiltersChange?.()
            }}
          >
            Effacer
          </Button>
        )
      }
    >
      <Select
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(e) => handleChange('status', e.target.value)}
        className="w-44"
        size="sm"
      />
      <Select
        options={employeeOptions}
        value={filters.user_id}
        onChange={(e) => handleChange('user_id', e.target.value)}
        className="w-48"
        size="sm"
      />
    </FilterBar>
  )
}

export default LeaveFilters