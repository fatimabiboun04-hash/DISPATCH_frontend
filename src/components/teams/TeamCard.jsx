import { motion } from 'framer-motion'
import { MoreVertical, Edit2, Trash2, Users } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import TeamMembersStack from './TeamMembersStack'
import { Badge, Tooltip } from '../ui'
import { cn } from '../../utils/cn'

/**
 * TeamCard — visual card for a single team.
 *
 * Per spec: NO tables. Cards only.
 * Shows: team name, color accent, member avatars, member names, actions.
 *
 * Backend shape:
 *   team: { id, name, description, color, leader_id,
 *           leader: { name }?,
 *           users: [{ id, name, avatar_url, pivot: { joined_at } }] }
 */
const TeamCard = ({
  team,
  onEdit,
  onDelete,
  onManageMembers,
  index = 0,
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef                 = useRef(null)
  const teamColor               = team.color || '#6172f3'
  const memberCount             = team.users?.length || 0

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className={cn(
        'group relative flex flex-col rounded-2xl',
        'border border-surface-200 bg-white',
        'shadow-card transition-all duration-200',
        'hover:shadow-card-hover hover:-translate-y-0.5',
        'dark:border-dark-600 dark:bg-dark-700 dark:shadow-dark-card'
      )}
    >
      {/* Color accent top bar */}
      <div
        className="h-1.5 w-full rounded-t-2xl"
        style={{ backgroundColor: teamColor }}
      />

      <div className="flex flex-col gap-4 p-5">
        {/* Header: name + menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Color dot */}
            <div
              className="h-3 w-3 flex-shrink-0 rounded-full shadow-sm"
              style={{ backgroundColor: teamColor }}
            />
            <h3 className="truncate text-sm font-bold
                           text-slate-800 dark:text-slate-100">
              {team.name}
            </h3>
          </div>

          {/* Action menu */}
          <div ref={menuRef} className="relative flex-shrink-0">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-lg',
                'text-slate-400 transition-all duration-150',
                'opacity-0 group-hover:opacity-100',
                'hover:bg-surface-100 hover:text-slate-600',
                'dark:hover:bg-dark-600 dark:hover:text-slate-300',
                menuOpen && 'opacity-100 bg-surface-100 dark:bg-dark-600'
              )}
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1,    y: 0  }}
                exit={{   opacity: 0, scale: 0.95, y: -4  }}
                className="absolute right-0 top-8 z-20 w-44 overflow-hidden
                           rounded-xl border border-surface-200 bg-white
                           shadow-strong dark:border-dark-500 dark:bg-dark-700"
              >
                <div className="p-1.5">
                  <button
                    onClick={() => { setMenuOpen(false); onManageMembers?.(team) }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2
                               text-xs text-slate-700 hover:bg-surface-50
                               dark:text-slate-300 dark:hover:bg-dark-600
                               transition-colors"
                  >
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    Gérer les membres
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onEdit?.(team) }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2
                               text-xs text-slate-700 hover:bg-surface-50
                               dark:text-slate-300 dark:hover:bg-dark-600
                               transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                    Modifier l'équipe
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onDelete?.(team) }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2
                               text-xs text-red-500 hover:bg-red-50
                               dark:hover:bg-red-900/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Description */}
        {team.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400
                        leading-relaxed line-clamp-2">
            {team.description}
          </p>
        )}

        {/* Leader badge */}
        {team.leader && (
          <div className="flex items-center gap-1.5">
            <span className="text-2xs text-slate-400">Responsable :</span>
            <Badge variant="primary" size="sm">{team.leader.name}</Badge>
          </div>
        )}

        {/* Member count */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {memberCount === 0
              ? 'Aucun membre'
              : `${memberCount} membre${memberCount > 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Avatar stack */}
        {memberCount > 0 && (
          <TeamMembersStack
            users={team.users}
            max={5}
            size="sm"
          />
        )}

        {/* Member names (first 3) */}
        {memberCount > 0 && (
          <div className="flex flex-wrap gap-1">
            {team.users.slice(0, 3).map((user) => (
              <span
                key={user.id}
                className="rounded-md bg-surface-100 px-2 py-0.5
                           text-2xs font-medium text-slate-600
                           dark:bg-dark-600 dark:text-slate-300"
              >
                {user.name.split(' ')[0]}
              </span>
            ))}
            {memberCount > 3 && (
              <span className="rounded-md bg-surface-100 px-2 py-0.5
                               text-2xs font-medium text-slate-400
                               dark:bg-dark-600">
                +{memberCount - 3}
              </span>
            )}
          </div>
        )}

        {/* Bottom: manage button (always visible) */}
        <button
          onClick={() => onManageMembers?.(team)}
          className={cn(
            'flex items-center justify-center gap-1.5 rounded-xl',
            'border border-dashed border-surface-300 py-2.5',
            'text-xs font-medium text-slate-400',
            'transition-all duration-150',
            'hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600',
            'dark:border-dark-500 dark:hover:border-brand-600',
            'dark:hover:bg-brand-900/10 dark:hover:text-brand-400'
          )}
        >
          <Users className="h-3.5 w-3.5" />
          Gérer les membres
        </button>
      </div>
    </motion.div>
  )
}

export default TeamCard