import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  selectUser,
  selectIsAuth,
  selectUserRole,
  selectIsAdmin,
  selectIsEmployee,
  selectAuthLoading,
} from '../features/auth/authSelectors'
import { logoutThunk } from '../features/auth/authThunks'

/**
 * useAuth — convenient hook for auth state + actions.
 */
export const useAuth = () => {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const user       = useSelector(selectUser)
  const isAuth     = useSelector(selectIsAuth)
  const role       = useSelector(selectUserRole)
  const isAdmin    = useSelector(selectIsAdmin)
  const isEmployee = useSelector(selectIsEmployee)
  const loading    = useSelector(selectAuthLoading)

  const logout = async () => {
    await dispatch(logoutThunk())
    navigate('/', { replace: true })
  }

  return { user, isAuth, role, isAdmin, isEmployee, loading, logout }
}