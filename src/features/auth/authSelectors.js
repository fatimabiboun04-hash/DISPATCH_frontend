import { createSelector } from '@reduxjs/toolkit'

export const selectUser         = (state) => state.auth.user
export const selectToken        = (state) => state.auth.token
export const selectAuthLoading  = (state) => state.auth.loading
export const selectAuthError    = (state) => state.auth.error
export const selectIsLocked     = (state) => state.auth.locked

/** Derived — only recomputes when `user` or `token` changes */
export const selectIsAuth       = createSelector([selectToken],  (t) => !!t)
export const selectUserRole     = createSelector([selectUser],   (u) => u?.role)
export const selectIsAdmin      = createSelector([selectUser],   (u) => u?.role === 'admin')
export const selectIsEmployee   = createSelector([selectUser],   (u) => u?.role === 'employee')