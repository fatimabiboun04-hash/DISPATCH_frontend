import { createAsyncThunk } from '@reduxjs/toolkit'
import shiftService from '../../services/shiftService'

export const fetchShiftsThunk = createAsyncThunk(
  'shifts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await shiftService.getAll()
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load shifts')
    }
  }
)

export const createShiftThunk = createAsyncThunk(
  'shifts/create',
  async (data, { rejectWithValue }) => {
    try {
      return await shiftService.create(data)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create shift')
    }
  }
)

export const updateShiftThunk = createAsyncThunk(
  'shifts/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await shiftService.update(id, data)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update shift')
    }
  }
)

/**
 * Deactivate shift — NOT a hard delete.
 * Backend: ShiftController@destroy → $shift->update(['is_active' => false])
 * Returns: successResponse(null, 'Shift deactivated')
 * We return the shiftId so the slice can update local state.
 */
export const deactivateShiftThunk = createAsyncThunk(
  'shifts/deactivate',
  async (id, { rejectWithValue }) => {
    try {
      await shiftService.deactivate(id)
      return id  // return the id so slice can mark is_active=false
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to deactivate shift')
    }
  }
)