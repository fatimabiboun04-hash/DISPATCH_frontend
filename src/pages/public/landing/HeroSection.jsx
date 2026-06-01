import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, Users, Calendar, Shield } from 'lucide-react'

const FEATURES = [
  { icon: Calendar, label: 'Planning Intelligent' },
  { icon: Users,    label: 'Gestion des Équipes' },
  { icon: BarChart3,label: 'Rapports & Analytics' },
  { icon: Shield,   label: 'Contrôle d\'Accès' },
]

/**
 * HeroSection — full-viewport hero with ambient background.
 */
const HeroSection = ({ onCTA }) => (
  <section
    id="hero"
    className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 pt-16"
  >
    {/* ── Ambient background ───────────────────────────────── */}
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Main glow */}
      <div className="absolute left-1/2 top-1/3 h-[800px] w-[800px]
                      -translate-x-1/2 -translate-y-1/2 rounded-full
                      bg-brand-500/8 blur-3xl" />
      {/* Secondary glows */}
      <div className="absolute left-1/4 top-1/2 h-64 w-64 rounded-full
                      bg-violet-500/6 blur-3xl" />
      <div className="absolute right-1/4 top-1/3 h-64 w-64 rounded-full
                      bg-cyan-500/6 blur-3xl" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Radial fade at edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent
                      via-transparent to-slate-950" />
    </div>

    <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 inline-flex items-center gap-2 rounded-full
                   border border-brand-500/20 bg-brand-500/5
                   px-4 py-1.5 text-xs font-medium text-brand-300"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse-ring" />
        Workforce Operations Platform
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-6 text-5xl font-extrabold leading-tight tracking-tight
                   text-white md:text-6xl lg:text-7xl"
      >
        Management{' '}
        <span className="text-gradient">Intelligent</span>
        <br />
        pour vos Équipes
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400"
      >
        A premium workforce operations platform that completely replaces Excel.
        Centralize planning, attendance, leave management, analytics,
        and team operations in one unified system.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-16 flex flex-wrap items-center justify-center gap-4"
      >
        <button
          onClick={onCTA}
          className="group flex items-center gap-2 rounded-xl bg-brand-500
                     px-7 py-3.5 text-sm font-semibold text-white
                     shadow-glow transition-all duration-200
                     hover:bg-brand-400 hover:shadow-glow active:scale-95"
        >
          Commencer maintenant
          <ArrowRight className="h-4 w-4 transition-transform duration-200
                                  group-hover:translate-x-1" />
        </button>
        <button
          onClick={() => document.getElementById('about')
                           ?.scrollIntoView({ behavior: 'smooth' })}
          className="rounded-xl border border-white/10 bg-white/5
                     px-7 py-3.5 text-sm font-semibold text-slate-300
                     backdrop-blur-sm transition-all duration-200
                     hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          En savoir plus
        </button>
      </motion.div>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        {FEATURES.map(({ icon: Icon, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.08 }}
            className="flex items-center gap-2 rounded-lg border border-white/8
                       bg-white/4 px-3 py-2 text-xs font-medium text-slate-300
                       backdrop-blur-sm"
          >
            <Icon className="h-3.5 w-3.5 text-brand-400" />
            {label}
          </motion.div>
        ))}
      </motion.div>

      {/* Floating dashboard preview */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-20 overflow-hidden rounded-2xl border border-white/8
                   bg-slate-900/60 shadow-2xl backdrop-blur-sm"
      >
        {/* Fake browser bar */}
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
          <div className="mx-auto flex items-center gap-2 rounded-md
                          bg-white/5 px-3 py-1 text-xs text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
            dispatch-live.app/admin/dashboard
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="p-4">
          {/* KPI row */}
          <div className="mb-3 grid grid-cols-4 gap-3">
            {[
              { label: 'Couverture',    value: '94%',  color: 'text-emerald-400' },
              { label: 'Présents',      value: '18',   color: 'text-blue-400' },
              { label: 'En retard',     value: '2',    color: 'text-amber-400' },
              { label: 'Congés',        value: '3',    color: 'text-violet-400' },
            ].map((kpi) => (
              <div key={kpi.label}
                   className="rounded-lg bg-white/4 p-3 text-left">
                <p className="text-2xs text-slate-500 mb-1">{kpi.label}</p>
                <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>
          {/* Fake chart bars */}
          <div className="flex items-end gap-1.5 h-20 rounded-lg bg-white/4 px-3 py-2">
            {[40,65,45,80,90,60,75,55,85,70,95,50].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-brand-500/40"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>

    {/* Scroll indicator */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2"
    >
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-slate-600">Défiler</span>
        <div className="h-10 w-5 rounded-full border border-slate-700
                        flex items-start justify-center pt-1.5">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-2 w-1 rounded-full bg-slate-500"
          />
        </div>
      </div>
    </motion.div>
  </section>
)

export default HeroSection