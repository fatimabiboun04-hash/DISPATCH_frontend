import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Zap, AlertCircle, LogIn } from 'lucide-react'
import { useState } from 'react'
import { loginThunk } from '../../../features/auth/authThunks'
import {
  selectAuthLoading,
  selectAuthError,
  selectIsAuth,
  selectUserRole,
} from '../../../features/auth/authSelectors'

import { clearError } from '../../../features/auth/authSlice'
import { ROLE_HOME } from '../../../constants/roles'
import { cn } from '../../../utils/cn'

const schema = z.object({
  email:    z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

/**
 * LoginSection — glassmorphism login card embedded in the landing page.
 */
const LoginSection = () => {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const loading    = useSelector(selectAuthLoading)
  const error      = useSelector(selectAuthError)
  const isAuth     = useSelector(selectIsAuth)
  const role       = useSelector(selectUserRole)
  const [showPw, setShowPw] = useState(false)
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuth && role) {
      navigate(ROLE_HOME[role] || '/', { replace: true })
    }
  }, [isAuth, role, navigate])

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const onSubmit = async (data) => {
    const result = await dispatch(loginThunk(data))
    if (loginThunk.fulfilled.match(result)) {
      const userRole = result.payload.user.role
      navigate(ROLE_HOME[userRole] || '/', { replace: true })
    }
  }

  return (
    <section id="login" ref={ref}
             className="relative bg-slate-950 py-32 overflow-hidden">

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px]
                        -translate-x-1/2 -translate-y-1/2 rounded-full
                        bg-brand-500/6 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-md px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl
                            bg-brand-500 shadow-glow">
              <Zap className="h-7 w-7 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">Bienvenue</h2>
          <p className="mt-2 text-sm text-slate-400">
            Connectez-vous à votre espace de travail
          </p>
        </motion.div>

        {/* Glassmorphism card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="overflow-hidden rounded-2xl border border-white/10
                     bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
        >
          {/* Error alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 flex items-start gap-3 rounded-xl
                         border border-red-500/20 bg-red-500/8 p-4"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

            {/* Email */}
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">
                Adresse email
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="votre@email.com"
                className={cn(
                  'w-full rounded-xl border px-4 py-3.5 text-sm',
                  'bg-white/6 text-slate-200 placeholder-slate-600',
                  'transition-all duration-200 outline-none',
                  'focus:ring-2',
                  errors.email
                    ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20'
                    : 'border-white/8 hover:border-white/14 focus:border-brand-500/60 focus:ring-brand-500/20'
                )}
              />
              {errors.email && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn(
                    'w-full rounded-xl border px-4 py-3.5 pr-12 text-sm',
                    'bg-white/6 text-slate-200 placeholder-slate-600',
                    'transition-all duration-200 outline-none',
                    'focus:ring-2',
                    errors.password
                      ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20'
                      : 'border-white/8 hover:border-white/14 focus:border-brand-500/60 focus:ring-brand-500/20'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-slate-500 hover:text-slate-300
                             transition-colors duration-150"
                >
                  {showPw
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye    className="h-4 w-4" />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2.5
                         rounded-xl bg-brand-500 py-3.5 text-sm font-semibold
                         text-white shadow-glow transition-all duration-200
                         hover:bg-brand-400 hover:shadow-glow
                         active:scale-95
                         disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full
                                  border-2 border-white border-t-transparent" />
                  Connexion en cours…
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-slate-600">
            Accès réservé aux membres de l'organisation.
          </p>
        </motion.div>

        {/* Version note */}
        <p className="mt-6 text-center text-xs text-slate-700">
          Dispatch Live v1.0 — Enterprise Workforce Management
        </p>
      </div>
    </section>
  )
}

export default LoginSection