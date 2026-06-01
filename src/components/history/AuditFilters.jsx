import { useDispatch, useSelector } from 'react-redux'
import { setAuditFilters, resetAuditFilters } from '../../features/history/historySlice'
import { selectAuditFilters }                 from '../../features/history/historySelectors'
import { FilterBar, Select, Input, Button }   from '../ui'
import { X } from 'lucide-react'

/**
 * AuditFilters — filter controls for audit trail.
 *
 * Backend GET /v1/audit-logs supports:
 *   action, entity_type, user_id, date_from, date_to
 *
 * action values seen in codebase:
 *   created, updated, deleted, approved, rejected, locked,
 *   generated, requested, week_locked, check_in, check_out,
 *   toggled, verified, overridden, suspended
 *
 * entity_type stored as full Laravel class name:
 *   App\Models\User, App\Models\Planning, etc.
 */

const ACTION_OPTIONS = [
  { value: '',           label: 'Toutes les actions'  },
  { value: 'created',    label: 'Créé'                },
  { value: 'updated',    label: 'Modifié'             },
  { value: 'deleted',    label: 'Supprimé'            },
  { value: 'approved',   label: 'Approuvé'            },
  { value: 'rejected',   label: 'Refusé'              },
  { value: 'locked',     label: 'Verrouillé'          },
  { value: 'week_locked',label: 'Semaine verrouillée' },
  { value: 'generated',  label: 'Généré'              },
  { value: 'check_in',   label: 'Pointage entrée'     },
  { value: 'check_out',  label: 'Pointage sortie'     },
  { value: 'suspended',  label: 'Suspendu'            },
  { value: 'verified',   label: 'Vérifié'             },
]

const ENTITY_OPTIONS = [
  { value: '',                        label: 'Toutes les entités'  },
  { value: 'App\\Models\\User',       label: 'Employé'            },
  { value: 'App\\Models\\Planning',   label: 'Planning'           },
  { value: 'App\\Models\\LeaveRequest', label: 'Congé'            },
  { value: 'App\\Models\\Report',     label: 'Rapport'            },
  { value: 'App\\Models\\Rating',     label: 'Évaluation'         },
  { value: 'App\\Models\\Pointage',   label: 'Pointage'           },
  { value: 'App\\Models\\Setting',    label: 'Paramètre'          },
]

const AuditFilters = ({ onFiltersChange, employees = [] }) => {
  const dispatch = useDispatch()
  const filters  = useSelector(selectAuditFilters)

  const employeeOptions = [
    { value: '', label: 'Tous les utilisateurs' },
    ...employees.map((e) => ({ value: String(e.id), label: e.name })),
  ]

  const handle = (key, val) => {
    dispatch(setAuditFilters({ [key]: val }))
    onFiltersChange?.()
  }

  const hasActive = Object.values(filters).some(Boolean)

  return (
    <FilterBar
      actions={
        hasActive && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<X className="h-3.5 w-3.5" />}
            onClick={() => {
              dispatch(resetAuditFilters())
              onFiltersChange?.()
            }}
          >
            Effacer
          </Button>
        )
      }
    >
      <Select
        options={ACTION_OPTIONS}
        value={filters.action}
        onChange={(e) => handle('action', e.target.value)}
        className="w-44"
        size="sm"
      />
      <Select
        options={ENTITY_OPTIONS}
        value={filters.entity_type}
        onChange={(e) => handle('entity_type', e.target.value)}
        className="w-40"
        size="sm"
      />
      <Select
        options={employeeOptions}
        value={filters.user_id}
        onChange={(e) => handle('user_id', e.target.value)}
        className="w-44"
        size="sm"
      />
      <Input
        type="date"
        value={filters.date_from}
        onChange={(e) => handle('date_from', e.target.value)}
        className="w-36"
        size="sm"
        placeholder="Du"
      />
      <Input
        type="date"
        value={filters.date_to}
        onChange={(e) => handle('date_to', e.target.value)}
        className="w-36"
        size="sm"
        placeholder="Au"
      />
    </FilterBar>
  )
}

export default AuditFilters