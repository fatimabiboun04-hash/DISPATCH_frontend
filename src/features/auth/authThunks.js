import { createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../../services/authService'

/**
 * Login thunk.
 * On success → returns { token, user }
 * On failure → rejects with { message, locked }
 */
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials)
      return data
    } catch (err) {
      return rejectWithValue({
        message: err.message || 'Identifiants incorrects.',
        locked:  err.data?.locked || false,
        reason:  err.data?.reason || '',
      })
    }
  }
)

/**
 * Logout thunk.
 * Calls API then clears local state regardless of API result.
 */
export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
    } catch {
      // Logout always succeeds on the frontend even if API fails
    }
    return null
  }
)