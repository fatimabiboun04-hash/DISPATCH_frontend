import { createAsyncThunk } from '@reduxjs/toolkit'
import taskService from '../../services/taskService'

export const fetchTasksThunk = createAsyncThunk(
  'tasks/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      return await taskService.getAll(params)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load tasks')
    }
  }
)

export const createTaskThunk = createAsyncThunk(
  'tasks/create',
  async (data, { rejectWithValue }) => {
    try {
      return await taskService.create(data)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create task')
    }
  }
)

export const updateTaskThunk = createAsyncThunk(
  'tasks/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await taskService.update(id, data)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update task')
    }
  }
)

export const deleteTaskThunk = createAsyncThunk(
  'tasks/delete',
  async (id, { rejectWithValue }) => {
    try {
      await taskService.delete(id)
      return id
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete task')
    }
  }
)

export const fetchMyTasksThunk = createAsyncThunk(
  'tasks/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      return await taskService.getMyTasks()
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load my tasks')
    }
  }
)
