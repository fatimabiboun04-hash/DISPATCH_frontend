import { Badge } from '../ui'
import { Shield, ShieldOff } from 'lucide-react'

/**
 * DeviceStatusBadge — trusted / untrusted indicator.
 * Maps Device.is_trusted (boolean) to colored badge.
 */
const DeviceStatusBadge = ({ isTrusted }) => (
  isTrusted ? (
    <Badge variant="success">
      <Shield className="h-3 w-3 mr-0.5" />
      Approuvé
    </Badge>
  ) : (
    <Badge variant="default">
      <ShieldOff className="h-3 w-3 mr-0.5" />
      Non approuvé
    </Badge>
  )
)

export default DeviceStatusBadge