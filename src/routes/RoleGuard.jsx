import { Navigate } from 'react-router-dom'
import { ROLE_HOME } from '../constants/roles'

/**
 * RoleGuard
 * Ensures the authenticated user has the required role.
 * Redirects to their correct home if role does not match.
 *
 * Usage:
 *   <RoleGuard requiredRole="admin">
 *     <AdminDashboard />
 *   </RoleGuard>
 */
const RoleGuard = ({ children, requiredRole }) => {
  const raw = localStorage.getItem('dispatch_user')
  let user = null
  try { user = raw ? JSON.parse(raw) : null } catch { user = null }

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (user.role !== requiredRole) {
    // Redirect to their correct home instead of an error page
    return <Navigate to={ROLE_HOME[user.role] || '/'} replace />
  }

  return children
}

export default RoleGuard