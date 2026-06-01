import { createAsyncThunk } from '@reduxjs/toolkit'
import pauseService from '../../services/pauseService'

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