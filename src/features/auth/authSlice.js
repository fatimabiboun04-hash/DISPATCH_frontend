import { createSlice } from '@reduxjs/toolkit'
import { loginThunk, logoutThunk } from './authThunks'

/**
 * Auth state shape:
 * - user:    { id, name, email, role, status, avatar, avatar_url }
 * - token:   string
 * - loading: boolean
 * - error:   string | null
 * - locked:  boolean  (suspended account flag)
 */

// Rehydrate from localStorage on app boot
const storedToken = localStorage.getItem('dispatch_token')
const storedUser  = localStorage.getItem('dispatch_user')

let parsedUser = null
try { parsedUser = storedUser ? JSON.parse(storedUser) : null } catch { parsedUser = null }

const initialState = {
  user:    parsedUser,
  token:   storedToken || null,
  loading: false,
  error:   null,
  locked:  false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Hard reset — used by 401 interceptor
    clearAuth: (state) => {
      state.user    = null
      state.token   = null
      state.error   = null
      state.locked  = false
      localStorage.removeItem('dispatch_token')
      localStorage.removeItem('dispatch_user')
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // ── Login ──────────────────────────────────────────────
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true
        state.error   = null
        state.locked  = false
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false
        state.token   = action.payload.token
        state.user    = action.payload.user
        // Persist to localStorage
        localStorage.setItem('dispatch_token', action.payload.token)
        localStorage.setItem('dispatch_user', JSON.stringify(action.payload.user))
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false
        state.error   = action.payload?.message || 'Login failed'
        state.locked  = action.payload?.locked  || false
      })

    // ── Logout ─────────────────────────────────────────────
    builder
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user    = null
        state.token   = null
        state.error   = null
        localStorage.removeItem('dispatch_token')
        localStorage.removeItem('dispatch_user')
      })
  },
})

export const { clearAuth, clearError } = authSlice.actions
export default authSlice.reducer