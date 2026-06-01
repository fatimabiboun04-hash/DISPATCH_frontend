import { Badge } from '../ui'

/**
 * LeaveStatusBadge — maps leave status to colored badge.
 *
 * Backend status values: 'pending' | 'approved' | 'rejected'
 * Per spec: ⏳ Pending | ✅ Approved | ❌ Rejected
 */
const STATUS_MAP = {
  pending:  { variant: 'warning', icon: '⏳', label: 'En attente'  },
  approved: { variant: 'success', icon: '✅', label: 'Approuvé'    },
  rejected: { variant: 'danger',  icon: '❌', label: 'Refusé'      },
}

const LeaveStatusBadge = ({ status, showIcon = true, size = 'md' }) => {
  const config = STATUS_MAP[status] || STATUS_MAP.pending
  return (
    <Badge variant={config.variant} size={size}>
      {showIcon && <span className="mr-0.5">{config.icon}</span>}
      {config.label}
    </Badge>
  )
}

export default LeaveStatusBadge