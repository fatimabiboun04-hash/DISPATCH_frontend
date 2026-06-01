import { createAsyncThunk } from '@reduxjs/toolkit'
import ratingService from '../../services/ratingService'

/**
 * Toggle rating: POST /v1/ratings/toggle/{employeeId}
 * Returns { rating, type, icon, message }
 */
export const toggleRatingThunk = createAsyncThunk(
  'ratings/toggle',
  async ({ employeeId, reason }, { rejectWithValue }) => {
    try {
      const data = await ratingService.toggle(employeeId, reason)
      return { employeeId, data }
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update rating')
    }
  }
)

/**
 * Fetch current week rating for one employee.
 * GET /v1/ratings/current/{employeeId}
 */
export const fetchCurrentRatingThunk = createAsyncThunk(
  'ratings/fetchCurrent',
  async (employeeId, { rejectWithValue }) => {
    try {
      const data = await ratingService.getCurrent(employeeId)
      return { employeeId, data }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)