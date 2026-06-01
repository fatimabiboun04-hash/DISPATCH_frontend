import { createAsyncThunk } from '@reduxjs/toolkit'
import pointageService from '../../services/pointageService'

/**
 * POST /v1/pointages/check-in
 * Body (FormData): latitude, longitude, device_fingerprint, selfie?
 * Returns: { pointage, status, delay_minutes, is_flagged, message }
 *
 * NOTE: Uses FormData for selfie upload support.
 * CheckInRequest authorize() = isEmployee() only.
 */
export const checkInThunk = createAsyncThunk(
  'pointage/checkIn',
  async (payload, { rejectWithValue }) => {
    try {
      return await pointageService.checkIn(payload)
    } catch (err) {
      return rejectWithValue(err.message || 'Échec du pointage d\'entrée')
    }
  }
)

/**
 * POST /v1/pointages/check-out
 * No body required.
 * Returns: { pointage, worked_hours, pause_deducted, early_leave_minutes, overtime_minutes, status }
 */
export const checkOutThunk = createAsyncThunk(
  'pointage/checkOut',
  async (_, { rejectWithValue }) => {
    try {
      return await pointageService.checkOut()
    } catch (err) {
      return rejectWithValue(err.message || 'Échec du pointage de sortie')
    }
  }
)

/**
 * GET /v1/me/pointages — paginatedResponse (paginate 15)
 */
export const fetchMyPointagesThunk = createAsyncThunk(
  'pointage/fetchMyPointages',
  async (params, { rejectWithValue }) => {
    try {
      return await pointageService.getMyPointages(params)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

/**
 * GET /v1/pointages/flagged (admin only)
 * Returns paginatedResponse with user, planning.shift, gpsLog loaded
 */
export const fetchFlaggedThunk = createAsyncThunk(
  'pointage/fetchFlagged',
  async (params, { rejectWithValue }) => {
    try {
      return await pointageService.getFlagged(params)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

/**
 * POST /v1/pointages/{id}/verify (admin)
 * Body: { is_valid: boolean, notes?: string }
 */
export const verifyFlagThunk = createAsyncThunk(
  'pointage/verifyFlag',
  async ({ id, is_valid, notes }, { rejectWithValue }) => {
    try {
      return await pointageService.verifyFlag(id, { is_valid, notes })
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

/**
 * GET /v1/pointage/absent-today (admin)
 * Returns: { absent_count, total_planned, absent_employees[] }
 */
export const fetchAbsentTodayThunk = createAsyncThunk(
  'pointage/fetchAbsentToday',
  async (_, { rejectWithValue }) => {
    try {
      return await pointageService.getAbsentToday()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

/**
 * GET /v1/pointage/replacement-suggestion/{planningId}
 * Returns: { planning_id, original_employee, suggestions[] }
 */
export const fetchReplacementSuggestionThunk = createAsyncThunk(
  'pointage/fetchReplacement',
  async (planningId, { rejectWithValue }) => {
    try {
      return await pointageService.getReplacementSuggestion(planningId)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)