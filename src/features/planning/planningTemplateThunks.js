import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/planningTemplateService'

export const fetchTemplatesThunk = createAsyncThunk(
  'planningTemplates/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await api.getAll()
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load templates')
    }
  }
)

export const createTemplateThunk = createAsyncThunk(
  'planningTemplates/create',
  async (data, { rejectWithValue }) => {
    try {
      return await api.create(data)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create template')
    }
  }
)

export const deleteTemplateThunk = createAsyncThunk(
  'planningTemplates/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(id)
      return id
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete template')
    }
  }
)

export const duplicateTemplateThunk = createAsyncThunk(
  'planningTemplates/duplicate',
  async ({ id, name }, { rejectWithValue }) => {
    try {
      return await api.duplicate(id, name)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to duplicate template')
    }
  }
)

export const loadTemplateThunk = createAsyncThunk(
  'planningTemplates/load',
  async ({ id, week_number, year }, { rejectWithValue }) => {
    try {
      return await api.load(id, { week_number, year })
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load template')
    }
  }
)
