import { motion }     from 'framer-motion'
import { MapPin, Phone, Mail, Calendar } from 'lucide-react'
import { Avatar, Badge, RatingBadge, SkillBadge } from '../ui'
import { getAvatarGradient } from '../../utils/avatarGenerator'
import { cn } from '../../utils/cn'

/**
 * ProfileHeader — employee profile page header.
 *
 * Shows:
 * - Cover background (gradient from avatar color)
 * - Large avatar
 * - Name, role, status
 * - Team badges (with tenure from pivot.joined_at → backend fix #6)
 * - Contact info
 * - Skills
 * - Current week rating
 *
 * Data shape from GET /v1/employees/{id}:
 *   employee: { name, email, phone, description, role, status,
 *               avatar_url, teams:[{name, pivot:{joined_at}}],
 *               skills:[{name, category, pivot:{level}}] }
 */
const ProfileHeader = ({ employee, currentRating }) => {
  const gradient = getAvatarGradient(employee.name)

  return (
    <div className="overflow-hidden rounded-2xl border border-surface-200
                    bg-white dark:border-dark-600 dark:bg-dark-700">
      {/* Cover */}
      <div
        className="h-32 w-full"
        style={{
          background: `linear-gradient(135deg, ${gradient.split('(')[1]?.split(')')[0]
            ? `${gradient}`
            : 'linear-gradient(135deg, #6172f3, #8098f9)'})`,
          opacity: 0.85,
        }}
      />

      {/* Content */}
      <div className="px-6 pb-6">
        {/* Avatar row */}
        <div className="flex items-end justify-between -mt-10 mb-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Avatar
              src={employee.avatar_url}
              name={employee.name}
              size="xl"
              ring
              ringColor="ring-white dark:ring-dark-700"
              className="shadow-strong"
            />
          </motion.div>

          {/* Rating badge */}
          {currentRating?.has_rating && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <RatingBadge type={currentRating.type} size="md" />
            </motion.div>
          )}
        </div>

        {/* Name + role */}
        <div className="mb-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {employee.name}
            </h2>
            <Badge
              variant={employee.status === 'active' ? 'success' : 'danger'}
              dot
              size="sm"
            >
              {employee.status === 'active' ? 'Actif' : 'Suspendu'}
            </Badge>
            <Badge variant="default" size="sm">
              {employee.role === 'admin' ? 'Administrateur' : 'Employé'}
            </Badge>
          </div>
          {employee.description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {employee.description}
            </p>
          )}
        </div>

        {/* Contact row */}
        <div className="mb-4 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            {employee.email}
          </span>
          {employee.phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {employee.phone}
            </span>
          )}
        </div>

        {/* Teams with tenure */}
        {employee.teams?.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {employee.teams.map((team) => {
              // tenure_label added by ProfileController fix #6
              const tenureLabel = team.tenure_label || `Membre de ${team.name}`
              return (
                <div
                  key={team.id}
                  className="flex items-center gap-1.5 rounded-lg border border-surface-200
                             bg-surface-50 px-3 py-1.5 dark:border-dark-500 dark:bg-dark-600"
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: team.color || '#6172f3' }}
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {team.name}
                  </span>
                  {team.months_in_team !== undefined && (
                    <span className="text-2xs text-slate-400">
                      · {team.months_in_team} mois
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Skills */}
        {employee.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {employee.skills.map((skill) => (
              <SkillBadge
                key={skill.id}
                name={skill.name}
                level={skill.pivot?.level}
                showLevel
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileHeader