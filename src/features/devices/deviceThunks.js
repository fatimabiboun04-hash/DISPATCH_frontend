import { createAsyncThunk } from '@reduxjs/toolkit'
import deviceService from '../../services/deviceService'

export const fetchDevicesThunk = createAsyncThunk(
  'devices/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      return await deviceService.getAll(params)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load devices')
    }
  }
)

/**
 * POST /v1/devices/{id}/trust
 * Returns updated device with user loaded.
 */
export const trustDeviceThunk = createAsyncThunk(
  'devices/trust',
  async (id, { rejectWithValue }) => {
    try {
      return await deviceService.trust(id)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to trust device')
    }
  }
)

/**
 * POST /v1/devices/{id}/untrust
 * Returns updated device with user loaded.
 */
export const untrustDeviceThunk = createAsyncThunk(
  'devices/untrust',
  async (id, { rejectWithValue }) => {
    try {
      return await deviceService.untrust(id)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to untrust device')
    }
  }
)