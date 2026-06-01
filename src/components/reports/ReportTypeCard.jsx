import { motion } from 'framer-motion'
import { FileText, BarChart3, Calendar } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * ReportTypeCard — quick-select template card for report type.
 *
 * Types from backend: 'weekly' | 'monthly' | 'custom'
 * File types: 'pdf' | 'excel'
 */
const TYPE_CONFIG = {
  weekly: {
    icon:        Calendar,
    label:       'Rapport Hebdomadaire',
    description: 'Heures, présences, congés et performances de la semaine',
    color:       'border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/10',
    iconColor:   'text-brand-500',
    iconBg:      'bg-brand-100 dark:bg-brand-900/30',
  },
  monthly: {
    icon:        BarChart3,
    label:       'Rapport Mensuel',
    description: 'Analyse complète des performances et statistiques du mois',
    color:       'border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-900/10',
    iconColor:   'text-violet-500',
    iconBg:      'bg-violet-100 dark:bg-violet-900/30',
  },
  custom: {
    icon:        FileText,
    label:       'Rapport Personnalisé',
    description: 'Définissez une période spécifique pour votre rapport',
    color:       'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10',
    iconColor:   'text-emerald-500',
    iconBg:      'bg-emerald-100 dark:bg-emerald-900/30',
  },
}

const ReportTypeCard = ({
  type,
  selected,
  onClick,
  index = 0,
}) => {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.custom
  const Icon   = config.icon

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.06 }}
      onClick={onClick}
      type="button"
      className={cn(
        'flex flex-col gap-3 rounded-2xl border-2 p-4 text-left',
        'transition-all duration-200',
        'hover:shadow-medium focus:outline-none',
        'focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
        selected
          ? [config.color, 'ring-2 ring-brand-500 ring-offset-2 shadow-medium']
          : 'border-surface-200 bg-white hover:border-surface-300 dark:border-dark-500 dark:bg-dark-700'
      )}
    >
      <div className={cn(
        'flex h-10 w-10 items-center justify-center rounded-xl',
        selected ? config.iconBg : 'bg-surface-100 dark:bg-dark-600'
      )}>
        <Icon className={cn(
          'h-5 w-5',
          selected ? config.iconColor : 'text-slate-400'
        )} />
      </div>
      <div>
        <p className={cn(
          'text-sm font-semibold',
          selected
            ? 'text-slate-800 dark:text-slate-100'
            : 'text-slate-600 dark:text-slate-300'
        )}>
          {config.label}
        </p>
        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
          {config.description}
        </p>
      </div>

      {/* Selected indicator */}
      {selected && (
        <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-brand-500" />
      )}
    </motion.button>
  )
}

export default ReportTypeCard