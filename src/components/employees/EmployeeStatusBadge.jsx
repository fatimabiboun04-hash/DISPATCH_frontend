import { Badge } from '../ui'

/**
 * EmployeeStatusBadge
 * Maps User.status ('active' | 'suspended') to colored badge.
 */
const EmployeeStatusBadge = ({ status }) => {
  if (status === 'active') {
    return <Badge variant="success" dot>Actif</Badge>
  }
  return <Badge variant="danger" dot>Suspendu</Badge>
}

export default EmployeeStatusBadge