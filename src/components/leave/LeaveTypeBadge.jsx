import { Badge } from '../ui'

/**
 * LeaveTypeBadge — maps leave type to colored badge.
 * Backend type enum: 'annual' | 'sick' | 'emergency' | 'unpaid'
 */
const TYPE_MAP = {
  annual:    { variant: 'primary', label: 'Congé annuel'  },
  sick:      { variant: 'warning', label: 'Maladie'       },
  emergency: { variant: 'danger',  label: 'Urgence'       },
  unpaid:    { variant: 'default', label: 'Sans solde'    },
}

const LeaveTypeBadge = ({ type, size = 'sm' }) => {
  const config = TYPE_MAP[type] || { variant: 'default', label: type }
  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  )
}

export default LeaveTypeBadge