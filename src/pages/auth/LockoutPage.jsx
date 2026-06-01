import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldOff, Mail, ArrowLeft } from 'lucide-react'

/**
 * LockoutPage
 * Full-screen suspension notice shown when backend returns locked:true.
 * Receives reason via URL query param: /lockout?reason=...
 */
const LockoutPage = () => {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const reason         = searchParams.get('reason') || 'Votre accès a été restreint par un administrateur.'

  // Clear any stale tokens (suspended users must not access the app)
  useEffect(() => {
    localStorage.removeItem('dispatch_token')
    localStorage.removeItem('dispatch_user')
  }, [])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">

      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/5 blur-3xl" />
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-red-600/5 blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-4 w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-2xl border border-red-900/30 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">

          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex h-20 w-20 items-center justify-center rounded-2xl
                         bg-red-500/10 ring-1 ring-red-500/20"
            >
              <ShieldOff className="h-10 w-10 text-red-400" />
            </motion.div>
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-2 text-center"
          >
            <h1 className="text-2xl font-bold text-slate-100">
              Accès Restreint
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Votre compte a été suspendu
            </p>
          </motion.div>

          {/* Divider */}
          <div className="my-6 border-t border-slate-800" />

          {/* Reason */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6 rounded-xl bg-red-500/5 border border-red-500/10 p-4"
          >
            <p className="text-sm text-red-300 leading-relaxed">
              {reason}
            </p>
          </motion.div>

          {/* Contact instruction */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-6 flex items-start gap-3 rounded-xl bg-slate-800/50 p-4"
          >
            <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Pour toute question, veuillez contacter votre administrateur
              ou le service RH de votre organisation.
            </p>
          </motion.div>

          {/* Back button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={() => navigate('/')}
            className="flex w-full items-center justify-center gap-2 rounded-xl
                       border border-slate-700 bg-slate-800 py-3 text-sm
                       font-medium text-slate-300
                       transition-all duration-200
                       hover:border-slate-600 hover:bg-slate-700 hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </motion.button>
        </div>

        {/* Footer note */}
        <p className="mt-4 text-center text-xs text-slate-600">
          Dispatch Live — Workforce Management Platform
        </p>
      </motion.div>
    </div>
  )
}

export default LockoutPage