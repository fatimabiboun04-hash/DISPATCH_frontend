import { createAsyncThunk } from '@reduxjs/toolkit'
import skillService from '../../services/skillService'

export const fetchSkillsThunk = createAsyncThunk(
  'skills/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await skillService.getAll()
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load skills')
    }
  }
)

export const createSkillThunk = createAsyncThunk(
  'skills/create',
  async (data, { rejectWithValue }) => {
    try {
      return await skillService.create(data)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create skill')
    }
  }
)

export const updateSkillThunk = createAsyncThunk(
  'skills/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await skillService.update(id, data)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update skill')
    }
  }
)

export const deleteSkillThunk = createAsyncThunk(
  'skills/delete',
  async (id, { rejectWithValue }) => {
    try {
      await skillService.delete(id)
      return id
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete skill')
    }
  }
)
