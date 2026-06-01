import { createAsyncThunk } from '@reduxjs/toolkit'
import teamService from '../../services/teamService'

export const fetchTeamsThunk = createAsyncThunk(
  'teams/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      return await teamService.getAll(params)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load teams')
    }
  }
)

export const fetchTeamThunk = createAsyncThunk(
  'teams/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await teamService.getOne(id)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load team')
    }
  }
)

export const createTeamThunk = createAsyncThunk(
  'teams/create',
  async (data, { rejectWithValue }) => {
    try {
      return await teamService.create(data)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create team')
    }
  }
)

export const updateTeamThunk = createAsyncThunk(
  'teams/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await teamService.update(id, data)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update team')
    }
  }
)

export const deleteTeamThunk = createAsyncThunk(
  'teams/delete',
  async (id, { rejectWithValue }) => {
    try {
      await teamService.delete(id)
      return id
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete team')
    }
  }
)

/**
 * Assign one employee to a team.
 * POST /v1/teams/{team}/assign — body: { user_id }
 * Backend uses syncWithoutDetaching → never removes existing members
 */
export const assignEmployeeThunk = createAsyncThunk(
  'teams/assignEmployee',
  async ({ teamId, userId }, { rejectWithValue }) => {
    try {
      return await teamService.assignEmployee(teamId, userId)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to assign employee')
    }
  }
)

/**
 * Remove one employee from a team.
 * DELETE /v1/teams/{team}/remove/{user}
 */
export const removeEmployeeThunk = createAsyncThunk(
  'teams/removeEmployee',
  async ({ teamId, userId }, { rejectWithValue }) => {
    try {
      return await teamService.removeEmployee(teamId, userId)
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to remove employee')
    }
  }
)