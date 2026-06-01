import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, UsersRound, CalendarDays,
  Clock, FileText, BarChart3, History,
  Settings, Shield, ChevronRight,  Timer,
} from 'lucide-react'
import { cn } from '../../utils/cn'

const LINKS = [
  { to: '/admin/dashboard',      icon: LayoutDashboard, label: 'Tableau de Bord' },
  { to: '/admin/planning',       icon: CalendarDays,    label: 'Planning'        },
  { to: '/admin/shifts',         icon: Clock,           label: 'Shifts'          },
  { to: '/admin/teams',          icon: UsersRound,      label: 'Équipes'         },
  { to: '/admin/employees',      icon: Users,           label: 'Employés'        },
  { to: '/admin/pointage-live',  icon: Timer,           label: 'Pointage Live'   },
  { to: '/admin/leave-requests', icon: FileText,        label: 'Congés'          },
  { to: '/admin/reports',        icon: BarChart3,       label: 'Rapports'        },
  { to: '/admin/history',        icon: History,         label: 'Historique'      },
  { to: '/admin/devices',        icon: Shield,          label: 'Appareils'       },
  { to: '/admin/settings',       icon: Settings,        label: 'Paramètres'      },
]

/**
 * AdminSidebarLinks — navigation links for the admin sidebar.
 * Collapses to icon-only when `collapsed` is true.
 */
const AdminSidebarLinks = ({ collapsed }) => (
  <nav className="flex flex-col gap-0.5 px-3">
    {LINKS.map(({ to, icon: Icon, label }) => (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          cn(
            'group flex items-center gap-3 rounded-lg px-3 py-2.5',
            'text-sm font-medium transition-all duration-150',
            isActive
              ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'
              : 'text-slate-600 hover:bg-surface-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-dark-600 dark:hover:text-slate-200',
            collapsed && 'justify-center px-2'
          )
        }
        title={collapsed ? label : undefined}
      >
        {({ isActive }) => (
          <>
            <Icon className={cn(
              'h-4.5 w-4.5 flex-shrink-0',
              isActive
                ? 'text-brand-500 dark:text-brand-400'
                : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
            )} />
            {!collapsed && (
              <>
                <span className="flex-1 truncate">{label}</span>
                {isActive && (
                  <ChevronRight className="h-3.5 w-3.5 text-brand-400" />
                )}
              </>
            )}
          </>
        )}
      </NavLink>
    ))}
  </nav>
)

export default AdminSidebarLinks