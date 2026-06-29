import { createAsyncThunk } from '@reduxjs/toolkit'
import pauseService from '../../services/pauseService'

/**
 * GET /v1/pauses — paginated list with filters
 */
export const fetchPausesListThunk = createAsyncThunk(
  'pauses/fetchList',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await pauseService.getAll(params)
      return data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load pauses')
    }
  }
)

/**
 * GET /v1/pauses/stats — aggregate statistics
 */
export const fetchPauseStatsThunk = createAsyncThunk(
  'pauses/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await pauseService.getStats()
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load stats')
    }
  }
)

/**
 * GET /v1/pauses/planning/{planningId}
 * Returns plain array of pauses with user + team loaded.
 */
export const fetchPausesByPlanningThunk = createAsyncThunk(
  'pauses/fetchByPlanning',
  async (planningId, { rejectWithValue }) => {
    try {
      const data = await pauseService.getByPlanning(planningId)
      return { planningId, data }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

/**
 * POST /v1/pauses
 * Single user: returns one pause object
 * Team:        returns array of pauses
 */
export const createPauseThunk = createAsyncThunk(
  'pauses/create',
  async ({ planningId, data }, { rejectWithValue }) => {
    try {
      const result = await pauseService.create(data)
      return { planningId, data: result }
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create pause')
    }
  }
)

/**
 * PUT /v1/pauses/{id}
 * Returns updated pause with user + planning.shift loaded.
 */
export const updatePauseThunk = createAsyncThunk(
  'pauses/update',
  async ({ pauseId, planningId, data }, { rejectWithValue }) => {
    try {
      const result = await pauseService.update(pauseId, data)
      return { planningId, data: result }
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update pause')
    }
  }
)

/**
 * GET /v1/pauses/batch?planning_ids=1,2,3
 * Returns { [planningId]: [...pauses] } grouped by planning_id.
 * Used by MyPlanningPage to load all pauses in a single request.
 */
export const fetchPausesBatchThunk = createAsyncThunk(
  'pauses/fetchBatch',
  async (planningIds, { rejectWithValue }) => {
    try {
      return await pauseService.batchGetByPlanning(planningIds)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load pauses')
    }
  }
)

/**
 * GET /v1/pauses/{id}
 */
export const fetchPauseThunk = createAsyncThunk(
  'pauses/fetchPause',
  async (pauseId, { rejectWithValue }) => {
    try {
      return await pauseService.getById(pauseId)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load pause')
    }
  }
)

/**
 * POST /v1/pauses/{id}/cancel
 */
export const cancelPauseThunk = createAsyncThunk(
  'pauses/cancel',
  async ({ pauseId, planningId }, { rejectWithValue }) => {
    try {
      const result = await pauseService.cancel(pauseId)
      return { planningId, data: result, pauseId }
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to cancel pause')
    }
  }
)

/**
 * POST /v1/pauses/{id}/complete
 */
export const completePauseThunk = createAsyncThunk(
  'pauses/complete',
  async ({ pauseId, planningId }, { rejectWithValue }) => {
    try {
      const result = await pauseService.complete(pauseId)
      return { planningId, data: result, pauseId }
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to complete pause')
    }
  }
)

/**
 * DELETE /v1/pauses/{id}
 * Returns successResponse(null, 'Pause deleted', 204) — has body.
 */
export const deletePauseThunk = createAsyncThunk(
  'pauses/delete',
  async ({ pauseId, planningId }, { rejectWithValue }) => {
    try {
      await pauseService.delete(pauseId)
      return { pauseId, planningId }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)