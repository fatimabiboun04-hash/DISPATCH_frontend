import { createAsyncThunk } from '@reduxjs/toolkit'
import notificationService from '../../services/notificationService'

export const fetchNotificationsThunk = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.getAll()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const fetchUnreadCountThunk = createAsyncThunk(
  'notifications/unreadCount',
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.getUnreadCount()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const markReadThunk = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.markRead(id)
      return id
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const markAllReadThunk = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllRead()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)