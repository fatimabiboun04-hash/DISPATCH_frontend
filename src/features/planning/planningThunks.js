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
      // Layer 2: Business-rule conflicts — 422 with errors.planning array
      if (err.status === 422 && err.errors?.planning) {
        return rejectWithValue({
          isConflict:  true,
          errors:      err.errors.planning,
          message:     err.message,
        })
      }
      // Layer 1: FormRequest field validation — 422 with errors.{field}[]
      if (err.status === 422 && err.errors) {
        const fieldMessages = Object.values(err.errors).flat().join('; ')
        return rejectWithValue({
          message:     fieldMessages || err.message || 'Données invalides',
          fieldErrors: err.errors,
        })
      }
      return rejectWithValue({ message: err.message || 'Erreur lors de la création' })
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
          isConflict:  true,
          errors:      err.errors.planning,
          message:     err.message,
        })
      }
      if (err.status === 422 && err.errors) {
        const fieldMessages = Object.values(err.errors).flat().join('; ')
        return rejectWithValue({
          message:     fieldMessages || err.message || 'Données invalides',
          fieldErrors: err.errors,
        })
      }
      return rejectWithValue({ message: err.message || 'Erreur lors de la mise à jour' })
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

export const lockPlanningThunk = createAsyncThunk(
  'planning/lockPlanning',
  async (planningId, { rejectWithValue }) => {
    try {
      return await planningService.lockPlanning(planningId)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to lock planning')
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

// ── BATCH OPERATIONS ──

export const batchDeletePlanningsThunk = createAsyncThunk(
  'planning/batchDelete',
  async (planningIds, { rejectWithValue }) => {
    try {
      return await planningService.batchDelete(planningIds)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to batch delete')
    }
  }
)

export const batchUpdateShiftThunk = createAsyncThunk(
  'planning/batchUpdateShift',
  async ({ planning_ids, shift_id }, { rejectWithValue }) => {
    try {
      return await planningService.batchUpdateShift({ planning_ids, shift_id })
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to batch update shift')
    }
  }
)

export const batchAssignEmployeeThunk = createAsyncThunk(
  'planning/batchAssignEmployee',
  async ({ planning_ids, user_id }, { rejectWithValue }) => {
    try {
      return await planningService.batchAssignEmployee({ planning_ids, user_id })
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to batch assign employee')
    }
  }
)

export const duplicateDayThunk = createAsyncThunk(
  'planning/duplicateDay',
  async ({ source_date, target_date }, { rejectWithValue }) => {
    try {
      return await planningService.duplicateDay({ source_date, target_date })
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to duplicate day')
    }
  }
)

export const validateBatchThunk = createAsyncThunk(
  'planning/validateBatch',
  async (items, { rejectWithValue }) => {
    try {
      return await planningService.validateBatch(items)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to validate batch')
    }
  }
)