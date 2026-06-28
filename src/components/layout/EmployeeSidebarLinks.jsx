import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, Clock,
  FileText, History, User, ChevronRight, ListChecks,
} from 'lucide-react'
import { cn } from '../../utils/cn'

const LINKS = [
  { to: '/employee/dashboard',         icon: LayoutDashboard, label: 'Tableau de Bord' },
  { to: '/employee/my-planning',        icon: CalendarDays,    label: 'Mon Planning'    },
  { to: '/employee/my-pointage',        icon: Clock,           label: 'Mon Pointage'    },
  { to: '/employee/my-leave-requests',  icon: FileText,        label: 'Mes Congés'      },
  { to: '/employee/my-history',         icon: History,         label: 'Mon Historique'  },
  { to: '/employee/my-tasks',           icon: ListChecks,     label: 'Mes Tâches'      },
  { to: '/employee/my-profile',         icon: User,            label: 'Mon Profil'      },
]

/**
 * EmployeeSidebarLinks — navigation links for the employee sidebar.
 */
const EmployeeSidebarLinks = ({ collapsed }) => (
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

export default EmployeeSidebarLinks