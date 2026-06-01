import { Navigate, useLocation } from 'react-router-dom'

/**
 * ProtectedRoute
 * Redirects unauthenticated users to the landing page.
 * Preserves the attempted URL for redirect after login.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('dispatch_token')
  const location = useLocation()

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute