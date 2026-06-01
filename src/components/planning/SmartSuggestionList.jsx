import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Zap, RefreshCw } from 'lucide-react'
import { suggestEmployeesThunk } from '../../features/planning/planningThunks'
import {
  selectSuggestions,
  selectSuggestionsLoading,
} from '../../features/planning/planningSelectors'
import SmartSuggestionItem from './SmartSuggestionItem'
import { Skeleton, Button } from '../ui'

/**
 * SmartSuggestionList — ranked employee suggestions for a planning slot.
 *
 * Calls POST /v1/planning/suggest with { shift_id, date, team_id? }
 * Returns up to 5 suggestions sorted by match_percentage desc.
 *
 * Used inside PlanningDrawer when admin clicks "Add Employee".
 */
const SmartSuggestionList = ({
  shiftId,
  date,
  teamId,
  onSelect,
  assigningId,  // employee id currently being assigned (for loading state)
}) => {
  const dispatch    = useDispatch()
  const suggestions = useSelector(selectSuggestions)
  const loading     = useSelector(selectSuggestionsLoading)

  const fetchSuggestions = () => {
    if (!shiftId || !date) return
    dispatch(suggestEmployeesThunk({
      shift_id: shiftId,
      date,
      team_id: teamId || undefined,
    }))
  }

  useEffect(() => {
    fetchSuggestions()
  }, [shiftId, date, teamId]) // eslint-disable-line

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}
               className="flex items-center gap-3 rounded-xl border
                          border-surface-100 p-3 dark:border-dark-600">
            <Skeleton.Circle size="h-8 w-8" />
            <div className="flex-1 space-y-1.5">
              <Skeleton.Line width="w-28" height="h-3" />
              <Skeleton.Line width="w-20" height="h-2" />
            </div>
            <Skeleton.Block className="h-9 w-9 rounded-lg" />
            <Skeleton.Block className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="rounded-xl border border-surface-100 px-4 py-6
                      text-center dark:border-dark-600">
        <Zap className="mx-auto mb-2 h-6 w-6 text-slate-300" />
        <p className="text-xs text-slate-400">
          Aucun employé disponible pour ce créneau
        </p>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          onClick={fetchSuggestions}
          className="mt-3"
        >
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {suggestions.map((suggestion, i) => (
        <SmartSuggestionItem
          key={suggestion.employee.id}
          suggestion={suggestion}
          index={i}
          loading={assigningId === suggestion.employee.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export default SmartSuggestionList