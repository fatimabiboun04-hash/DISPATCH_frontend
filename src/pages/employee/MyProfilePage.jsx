import { useEffect, useState } from 'react'
import { useDispatch }         from 'react-redux'
import { useForm }             from 'react-hook-form'
import { z }                   from 'zod'
import { zodResolver }         from '@hookform/resolvers/zod'
import { motion }              from 'framer-motion'
import { useAuth }             from '../../hooks/useAuth'
import profileService          from '../../services/profileService'
import AvatarUploader          from './AvatarUploader'
import {
  Input, Button, Card, HoursBar,
  RatingBadge, SkillBadge, Skeleton, Tabs,
  ErrorState,
} from '../../components/ui'
import { getHoursClasses }     from '../../utils/hoursColor'
import { differenceInMonths, parseISO, isValid } from 'date-fns'
import toast                   from 'react-hot-toast'
import { cn }                  from '../../utils/cn'
import { User, Lock }          from 'lucide-react'

/**
 * MyProfilePage — /employee/my-profile
 *
 * Data: GET /v1/me → { profile, stats, current_rating }
 *
 * Update: PUT /v1/me via FormData (avatar support).
 * ProfileController@update validates:
 *   name, phone, description, avatar(image max:2048),
 *   current_password (required_with:password),
 *   password (min:8 confirmed)
 *
 * Fix #4: avatar on public disk (if applied).
 * Fix #16: teams have tenure_label + months_in_team (if applied).
 *   Frontend uses tenure_label if present, otherwise computes from pivot.joined_at.
 */

const PROFILE_TABS = [
  { value: 'info',     label: 'Informations'     },
  { value: 'password', label: 'Mot de passe'     },
]

const profileSchema = z.object({
  name:        z.string().min(2, 'Minimum 2 caractères'),
  phone:       z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
})

const passwordSchema = z.object({
  current_password:      z.string().min(1, 'Requis'),
  password:              z.string().min(8, 'Minimum 8 caractères'),
  password_confirmation: z.string().min(1, 'Requis'),
}).refine(
  (d) => d.password === d.password_confirmation,
  { message: 'Les mots de passe ne correspondent pas', path: ['password_confirmation'] }
)

const MyProfilePage = () => {
  const { user }   = useAuth()
  const dispatch   = useDispatch()

  const [profile,    setProfile]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [loadError,  setLoadError]  = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [activeTab,  setActiveTab]  = useState('info')

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm({ resolver: zodResolver(profileSchema) })

  const {
    register: regPw,
    handleSubmit: handlePw,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm({ resolver: zodResolver(passwordSchema) })

  // Load profile on mount
  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const data = await profileService.getProfile()
        setProfile(data)
        resetProfile({
          name:        data.profile?.name        || '',
          phone:       data.profile?.phone       || '',
          description: data.profile?.description || '',
        })
      } catch (err) { setLoadError(err.message || 'Erreur lors du chargement du profil') } finally { setLoading(false) }
    }
    fetch()
  }, []) // eslint-disable-line

  const onSaveProfile = async (data) => {
    setSaving(true)
    try {
      const updated = await profileService.updateProfile({
        ...data,
        ...(avatarFile ? { avatar: avatarFile } : {}),
      })
      // Update local profile state with new data
      setProfile((prev) => ({
        ...prev,
        profile: { ...prev.profile, ...updated },
      }))
      setAvatarFile(null)
      toast.success('Profil mis à jour')
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const onChangePassword = async (data) => {
    setSaving(true)
    try {
      await profileService.updateProfile({
        current_password:      data.current_password,
        password:              data.password,
        password_confirmation: data.password_confirmation,
      })
      toast.success('Mot de passe modifié')
      resetPw()
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('incorrect') || msg.includes('password')) {
        toast.error('Mot de passe actuel incorrect')
      } else {
        toast.error('Erreur lors du changement de mot de passe')
      }
    } finally {
      setSaving(false)
    }
  }

  const stats        = profile?.stats
  const currentRating= profile?.current_rating
  const userData     = profile?.profile
  const hoursClasses = stats ? getHoursClasses(stats.weekly_hours) : null

  if (loadError) {
    return <ErrorState message={loadError} onRetry={() => window.location.reload()} />
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-5 max-w-2xl mx-auto">
        <Skeleton.Block className="h-32 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton.Card /><Skeleton.Card />
        </div>
        <Skeleton.Block className="h-48 rounded-2xl" />
      </div>
    )
  }

  // Compute tenure from pivot.joined_at if tenure_label not present (fix #16)
  const getTeamTenure = (team) => {
    if (team.tenure_label)    return team.tenure_label
    if (!team.pivot?.joined_at) return `Membre de ${team.name}`
    const joinedAt = parseISO(team.pivot.joined_at)
    if (!isValid(joinedAt))  return `Membre de ${team.name}`
    const months = differenceInMonths(new Date(), joinedAt)
    return `Membre de ${team.name} depuis ${months} mois`
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Mon Profil
        </h1>
        <p className="mt-0.5 text-sm text-slate-400">
          Gérez vos informations personnelles
        </p>
      </motion.div>

      {/* Profile header card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card>
          <div className="flex items-start gap-5">
            {/* Avatar uploader */}
            <AvatarUploader
              currentUrl={userData?.avatar_url}
              name={userData?.name || ''}
              onChange={setAvatarFile}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {userData?.name}
              </p>
              {userData?.description && (
                <p className="text-sm text-slate-500 mt-0.5">
                  {userData.description}
                </p>
              )}
              {userData?.email && (
                <p className="text-xs text-slate-400 mt-1">{userData.email}</p>
              )}

              {/* Teams with tenure */}
              {userData?.teams?.length > 0 && (
                <div className="mt-2 flex flex-col gap-1">
                  {userData.teams.map((team) => (
                    <p key={team.id}
                       className="text-xs text-slate-500 dark:text-slate-400">
                      🏷️ {getTeamTenure(team)}
                    </p>
                  ))}
                </div>
              )}

              {/* Rating */}
              {currentRating?.has_rating && (
                <div className="mt-2">
                  <RatingBadge type={currentRating.type} />
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {userData?.skills?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-surface-100
                            pt-4 dark:border-dark-600">
              {userData.skills.map((skill) => (
                <SkillBadge
                  key={skill.id}
                  name={skill.name}
                  level={skill.pivot?.level}
                  showLevel
                />
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Stats cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          <Card>
            <p className="mb-2 text-xs text-slate-500">Heures cette semaine</p>
            <p className={cn('text-2xl font-bold', hoursClasses?.text)}>
              {stats.weekly_hours}h
            </p>
            <HoursBar
              hours={stats.weekly_hours}
              limit={stats.weekly_limit}
              showLabel={false}
              showAlert
              className="mt-2"
            />
          </Card>

          {/* Monthly hours — fix #16 */}
          <Card>
            <p className="mb-2 text-xs text-slate-500">
              {stats.monthly_hours !== undefined
                ? 'Heures ce mois'
                : 'Semaine actuelle'}
            </p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {stats.monthly_hours !== undefined
                ? `${stats.monthly_hours}h`
                : `S${stats.current_week}`}
            </p>
            {stats.monthly_hours_label && (
              <p className="text-2xs text-slate-400 mt-1">
                {stats.monthly_hours_label}
              </p>
            )}
          </Card>
        </motion.div>
      )}

      {/* Edit tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <Tabs
            tabs={PROFILE_TABS}
            value={activeTab}
            onChange={setActiveTab}
            className="mb-5"
          />

          {/* Info tab */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Avatar change indicator */}
              {avatarFile && (
                <div className="rounded-xl border border-brand-200 bg-brand-50
                                px-3 py-2 text-xs text-brand-700
                                dark:border-brand-800 dark:bg-brand-900/20
                                dark:text-brand-300">
                  📷 Nouvelle photo sélectionnée — sauvegardez pour appliquer
                </div>
              )}
              <Input
                label="Nom complet"
                required
                error={profileErrors.name?.message}
                {...regProfile('name')}
              />
              <Input
                label="Téléphone"
                type="tel"
                error={profileErrors.phone?.message}
                {...regProfile('phone')}
              />
              <Input
                label="Description / Poste"
                error={profileErrors.description?.message}
                {...regProfile('description')}
              />
              <Button
                fullWidth
                loading={saving}
                onClick={handleProfile(onSaveProfile)}
                leftIcon={<User className="h-4 w-4" />}
              >
                Enregistrer les modifications
              </Button>
            </div>
          )}

          {/* Password tab */}
          {activeTab === 'password' && (
            <div className="space-y-4">
              <Input
                label="Mot de passe actuel"
                type="password"
                required
                error={pwErrors.current_password?.message}
                {...regPw('current_password')}
              />
              <Input
                label="Nouveau mot de passe"
                type="password"
                required
                error={pwErrors.password?.message}
                helper="Minimum 8 caractères"
                {...regPw('password')}
              />
              <Input
                label="Confirmer le nouveau mot de passe"
                type="password"
                required
                error={pwErrors.password_confirmation?.message}
                {...regPw('password_confirmation')}
              />
              <Button
                fullWidth
                loading={saving}
                onClick={handlePw(onChangePassword)}
                leftIcon={<Lock className="h-4 w-4" />}
              >
                Changer le mot de passe
              </Button>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}

export default MyProfilePage