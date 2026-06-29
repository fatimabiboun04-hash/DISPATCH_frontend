import { createAsyncThunk } from '@reduxjs/toolkit'
import ratingService from '../../services/ratingService'

/**
 * Rate employee: POST /v1/ratings/rate/{employeeId}
 */
export const rateEmployeeThunk = createAsyncThunk(
  'ratings/rate',
  async ({ employeeId, score, comment }, { rejectWithValue }) => {
    try {
      const data = await ratingService.rate(employeeId, { score, comment })
      return { employeeId, data }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update rating')
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

/**
 * Fetch rating stats: GET /v1/ratings/stats
 */
export const fetchRatingStatsThunk = createAsyncThunk(
  'ratings/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await ratingService.getStats()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)