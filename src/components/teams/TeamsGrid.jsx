import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import TeamCard   from './TeamCard'
import { EmptyState, ErrorState, Skeleton } from '../ui'

/**
 * TeamsGrid — responsive card grid.
 * Renders skeleton, empty state, error state, or team cards.
 */
const TeamsGrid = ({
  teams   = [],
  loading = false,
  error   = null,
  onRetry,
  onEdit,
  onDelete,
  onManageMembers,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-surface-200 bg-white
                       p-5 dark:border-dark-600 dark:bg-dark-700"
          >
            {/* Color bar */}
            <div className="shimmer mb-4 h-1.5 w-full rounded-full" />
            <div className="flex items-center gap-2.5 mb-3">
              <Skeleton.Block className="h-3 w-3 rounded-full" />
              <Skeleton.Line width="w-28" height="h-4" />
            </div>
            <Skeleton.Line width="w-full" height="h-3" className="mb-1" />
            <Skeleton.Line width="w-3/4" height="h-3" className="mb-4" />
            {/* Avatar stack skeleton */}
            <div className="flex -space-x-2 mb-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton.Circle key={j} size="h-8 w-8" />
              ))}
            </div>
            <Skeleton.Block className="h-9 w-full rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />
  }

  if (teams.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Aucune équipe"
        description="Créez votre première équipe pour organiser vos employés."
        size="lg"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {teams.map((team, i) => (
        <TeamCard
          key={team.id}
          team={team}
          index={i}
          onEdit={onEdit}
          onDelete={onDelete}
          onManageMembers={onManageMembers}
        />
      ))}
    </div>
  )
}

export default TeamsGrid