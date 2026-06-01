import { createAsyncThunk } from '@reduxjs/toolkit'
import planningService from '../../services/planningService'

export const fetchPlanningThunk = createAsyncThunk(
  'planning/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      return await planningService.getAll(params)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load planning')
    }
  }
)

export const createPlanningThunk = createAsyncThunk(
  'planning/create',
  async (data, { rejectWithValue }) => {
    try {
      return await planningService.create(data)
    } catch (err) {
      // Conflict detection returns 422 with errors.planning array
      if (err.status === 422 && err.errors?.planning) {
        return rejectWithValue({
          isConflict: true,
          errors:     err.errors.planning,
          message:    err.message,
        })
      }
      return rejectWithValue({ message: err.message || 'Failed to create planning' })
    }
  }
)

export const updatePlanningThunk = createAsyncThunk(
  'planning/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await planningService.update(id, data)
    } catch (err) {
      if (err.status === 422 && err.errors?.planning) {
        return rejectWithValue({
          isConflict: true,
          errors:     err.errors.planning,
          message:    err.message,
        })
      }
      return rejectWithValue({ message: err.message || 'Failed to update planning' })
    }
  }
)

export const deletePlanningThunk = createAsyncThunk(
  'planning/delete',
  async (id, { rejectWithValue }) => {
    try {
      await planningService.delete(id)
      return id
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const suggestEmployeesThunk = createAsyncThunk(
  'planning/suggest',
  async (params, { rejectWithValue }) => {
    try {
      return await planningService.suggest(params)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const lockCurrentWeekThunk = createAsyncThunk(
  'planning/lockCurrentWeek',
  async (_, { rejectWithValue }) => {
    try {
      return await planningService.lockCurrentWeek()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const generateNextWeekThunk = createAsyncThunk(
  'planning/generateNextWeek',
  async (_, { rejectWithValue }) => {
    try {
      return await planningService.generateNextWeek()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const overrideLockThunk = createAsyncThunk(
  'planning/overrideLock',
  async (planningId, { rejectWithValue }) => {
    try {
      return await planningService.overrideLock(planningId)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)
/**
 * Fetch planning history for a specific past week.
 * Uses same GET /v1/planning endpoint with week_number + year params.
 * Backend note: gap fix #3 filters (team_id, shift_id, is_locked)
 * were identified but not yet in original file.
 * We pass week_number + year only — guaranteed to work.
 */
export const fetchPlanningHistoryThunk = createAsyncThunk(
  'planning/fetchHistory',
  async (params, { rejectWithValue }) => {
    try {
      return await planningService.getAll(params)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load planning history')
    }
  }
)