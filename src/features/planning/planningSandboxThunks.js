import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/planningSandboxService'

export const generateSandboxThunk = createAsyncThunk(
  'planningSandbox/generate',
  async (params, { rejectWithValue }) => {
    try {
      return await api.generate(params)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to generate sandbox preview')
    }
  }
)

export const previewSandboxThunk = createAsyncThunk(
  'planningSandbox/preview',
  async (sessionId, { rejectWithValue }) => {
    try {
      return await api.preview(sessionId)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load sandbox preview')
    }
  }
)

export const acceptSandboxThunk = createAsyncThunk(
  'planningSandbox/accept',
  async (sessionId, { rejectWithValue }) => {
    try {
      return await api.accept(sessionId)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to accept sandbox')
    }
  }
)

export const cancelSandboxThunk = createAsyncThunk(
  'planningSandbox/cancel',
  async (sessionId, { rejectWithValue }) => {
    try {
      await api.cancel(sessionId)
      return sessionId
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to cancel sandbox')
    }
  }
)
