import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  Calendar, Users, Clock, FileText,
  BarChart3, Bell, CheckCircle, X
} from 'lucide-react'

const MODULES = [
  { icon: Calendar,  title: 'Planning',        desc: 'Planification hebdomadaire par glisser-déposer avec détection automatique des conflits.' },
  { icon: Clock,     title: 'Pointage',         desc: 'Suivi des présences en temps réel avec validation GPS et empreinte digitale.' },
  { icon: Users,     title: 'Équipes',          desc: 'Gestion visuelle des équipes avec assignation dynamique des employés.' },
  { icon: FileText,  title: 'Congés',           desc: 'Soumission, approbation et intégration automatique au planning.' },
  { icon: BarChart3, title: 'Rapports',         desc: 'Rapports hebdomadaires et mensuels exportables en PDF et Excel.' },
  { icon: Bell,      title: 'Notifications',    desc: 'Alertes en temps réel pour retards, absences, congés et dépassements.' },
]

const EXCEL_PROBLEMS = [
  'Conflits de planning non détectés',
  'Calcul manuel des heures',
  'Pas de suivi des présences',
  'Rapports lents et fastidieux',
  'Aucune alerte automatique',
  'Données dispersées',
]

const PLATFORM_ADVANTAGES = [
  'Détection de conflits en temps réel',
  'Calcul automatique des heures',
  'Pointage GPS + biométrique',
  'Rapports générés en 1 clic',
  'Alertes intelligentes',
  'Données centralisées',
]

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

/**
 * AboutSection — explains the platform and its advantages over Excel.
 */
const AboutSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="about" ref={ref} className="bg-slate-950 py-32">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          transition={{ duration: 0.5 }}
          className="mb-20 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-brand-500/20
                           bg-brand-500/5 px-3 py-1 text-xs font-medium text-brand-400">
            Pourquoi Dispatch Live ?
          </span>
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Remplacez Excel{' '}
            <span className="text-gradient">définitivement</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Une plateforme entreprise complète qui centralise toutes vos
            opérations RH dans une seule interface moderne et intelligente.
          </p>
        </motion.div>

        {/* Excel vs Platform comparison */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-24 grid gap-6 md:grid-cols-2"
        >
          {/* Excel problems */}
          <div className="rounded-2xl border border-red-900/20 bg-red-950/10 p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <h3 className="text-sm font-semibold text-red-400">
                Avec Excel
              </h3>
            </div>
            <ul className="space-y-3">
              {EXCEL_PROBLEMS.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-400">
                  <X className="h-4 w-4 flex-shrink-0 text-red-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Platform advantages */}
          <div className="rounded-2xl border border-emerald-900/20 bg-emerald-950/10 p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-semibold text-emerald-400">
                Avec Dispatch Live
              </h3>
            </div>
            <ul className="space-y-3">
              {PLATFORM_ADVANTAGES.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Modules grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((mod, i) => (
            <motion.div
              key={mod.title}
              variants={fadeInUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
              className="group rounded-2xl border border-white/6 bg-white/3
                         p-6 transition-all duration-300
                         hover:border-brand-500/20 hover:bg-white/6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center
                              rounded-xl bg-brand-500/10
                              transition-colors duration-200
                              group-hover:bg-brand-500/15">
                <mod.icon className="h-5 w-5 text-brand-400" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-slate-200">
                {mod.title}
              </h3>
              <p className="text-xs leading-relaxed text-slate-500">
                {mod.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AboutSection