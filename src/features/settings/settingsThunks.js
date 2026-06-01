import { createAsyncThunk } from '@reduxjs/toolkit'
import settingsService from '../../services/settingsService'

/**
 * GET /v1/settings
 * Returns grouped settings: { general: [...], gps: [...], ... }
 */
export const fetchSettingsThunk = createAsyncThunk(
  'settings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await settingsService.getAll()
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load settings')
    }
  }
)

/**
 * PUT /v1/settings
 * Body: { settings: [{ key, value, group }] }
 * Returns updated grouped settings.
 */
export const updateSettingsThunk = createAsyncThunk(
  'settings/update',
  async (settingsArray, { rejectWithValue }) => {
    try {
      return await settingsService.update(settingsArray)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update settings')
    }
  }
)