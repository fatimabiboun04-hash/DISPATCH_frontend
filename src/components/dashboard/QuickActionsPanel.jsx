import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Calendar, FileText, Printer, Users, CheckCircle, AlertTriangle,
} from 'lucide-react'
import {
  selectQuickActions,
  selectNavigation,
} from '../../features/dashboard/dashboardSelectors'
import { Card, Button } from '../ui'

const QuickActionsPanel = () => {
  const qa = useSelector(selectQuickActions)
  const nav = useSelector(selectNavigation)
  const navigate = useNavigate()

  const actions = [
    {
      key: 'planning',
      label: 'Ouvrir le Planning',
      icon: Calendar,
      color: 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400',
      onClick: () => navigate('/admin/planning'),
      enabled: true,
    },
    {
      key: 'report',
      label: 'Générer un Rapport',
      icon: FileText,
      color: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
      onClick: () => navigate('/admin/reports'),
      enabled: qa?.can_generate_report,
    },
    {
      key: 'print',
      label: 'Imprimer le Planning',
      icon: Printer,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
      onClick: () => navigate('/admin/planning'),
      enabled: qa?.can_print_planning,
    },
    {
      key: 'employees',
      label: 'Voir les Employés',
      icon: Users,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      onClick: () => navigate('/admin/employees'),
      enabled: true,
    },
    {
      key: 'leaves',
      label: 'Approuver les Congés',
      icon: CheckCircle,
      color: qa?.has_pending_leaves
        ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
        : 'bg-slate-50 text-slate-400 dark:bg-dark-600',
      onClick: () => navigate('/admin/leave-requests'),
      enabled: true,
      badge: qa?.has_pending_leaves ? '!' : null,
    },
    {
      key: 'conflicts',
      label: 'Résoudre les Conflits',
      icon: AlertTriangle,
      color: qa?.has_flagged_pointages
        ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
        : 'bg-slate-50 text-slate-400 dark:bg-dark-600',
      onClick: () => navigate('/admin/pointage-live'),
      enabled: true,
      badge: qa?.has_flagged_pointages ? '!' : null,
    },
  ]

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center gap-2">
          <Card.Title>Actions Rapides</Card.Title>
        </div>
      </Card.Header>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={action.onClick}
            disabled={!action.enabled}
            className="flex flex-col items-center gap-2 rounded-xl border border-surface-100
                       p-4 transition-all hover:border-brand-200 hover:shadow-sm
                       hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed
                       dark:border-dark-600 dark:hover:border-brand-700"
          >
            <div className={`rounded-xl p-2.5 ${action.color}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-2xs font-medium text-slate-600 dark:text-slate-300 text-center leading-tight">
              {action.label}
            </span>
            {action.badge && (
              <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center
                               rounded-full bg-amber-500 text-2xs font-bold text-white">
                !
              </span>
            )}
          </button>
        ))}
      </div>
    </Card>
  )
}

export default QuickActionsPanel
