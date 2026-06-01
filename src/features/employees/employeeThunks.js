import { createAsyncThunk } from '@reduxjs/toolkit'
import employeeService from '../../services/employeeService'

export const fetchEmployeesThunk = createAsyncThunk(
  'employees/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      return await employeeService.getAll(params)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load employees')
    }
  }
)

export const fetchEmployeeThunk = createAsyncThunk(
  'employees/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await employeeService.getOne(id)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load employee')
    }
  }
)

export const createEmployeeThunk = createAsyncThunk(
  'employees/create',
  async (data, { rejectWithValue }) => {
    try {
      return await employeeService.create(data)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create employee')
    }
  }
)

export const updateEmployeeThunk = createAsyncThunk(
  'employees/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await employeeService.update(id, data)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update employee')
    }
  }
)

export const deleteEmployeeThunk = createAsyncThunk(
  'employees/delete',
  async (id, { rejectWithValue }) => {
    try {
      await employeeService.delete(id)
      return id
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete employee')
    }
  }
)

export const fetchEmployeeHistoryThunk = createAsyncThunk(
  'employees/fetchHistory',
  async ({ id, params }, { rejectWithValue }) => {
    try {
      return await employeeService.getHistory(id, params)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const fetchEmployeePlanningThunk = createAsyncThunk(
  'employees/fetchPlanning',
  async ({ id, params }, { rejectWithValue }) => {
    try {
      return await employeeService.getPlanning(id, params)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const fetchEmployeePointagesThunk = createAsyncThunk(
  'employees/fetchPointages',
  async ({ id, params }, { rejectWithValue }) => {
    try {
      return await employeeService.getPointages(id, params)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)