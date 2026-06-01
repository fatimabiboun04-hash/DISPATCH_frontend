/**
 * Auth selectors — memoized access to auth state.
 */
export const selectUser         = (state) => state.auth.user
export const selectToken        = (state) => state.auth.token
export const selectIsAuth       = (state) => !!state.auth.token
export const selectAuthLoading  = (state) => state.auth.loading
export const selectAuthError    = (state) => state.auth.error
export const selectIsLocked     = (state) => state.auth.locked
export const selectUserRole     = (state) => state.auth.user?.role
export const selectIsAdmin      = (state) => state.auth.user?.role === 'admin'
export const selectIsEmployee   = (state) => state.auth.user?.role === 'employee'