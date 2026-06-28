import { createSlice } from '@reduxjs/toolkit'
import {
  fetchNotificationsThunk,
  fetchUnreadCountThunk,
  markReadThunk,
  markAllReadThunk,
} from './notificationThunks'

const initialState = {
  items:       [],
  unreadCount: 0,
  loading:     false,
  error:       null,
  pagination:  null,
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Optimistically mark one as read in local state
    markOneRead: (state, action) => {
      const item = state.items.find((n) => n.id === action.payload)
      if (item && !item.read_at) {
        item.read_at      = new Date().toISOString()
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    // Optimistically mark all read
    markAllReadLocal: (state) => {
      state.items.forEach((n) => {
        if (!n.read_at) n.read_at = new Date().toISOString()
      })
      state.unreadCount = 0
    },
  },
  extraReducers: (builder) => {
    // ── Fetch notifications ──────────────────────────────
    builder
      .addCase(fetchNotificationsThunk.pending, (state) => {
        state.loading = true
        state.error   = null
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.loading    = false
        state.items      = action.payload.data
        state.pagination = action.payload.meta ?? null
      })
      .addCase(fetchNotificationsThunk.rejected, (state, action) => {
        state.loading = false
        state.error   = action.payload
      })

    // ── Fetch unread count ───────────────────────────────
    builder
      .addCase(fetchUnreadCountThunk.pending, (state) => {
        // no loading indicator needed for the badge count
      })
      .addCase(fetchUnreadCountThunk.fulfilled, (state, action) => {
        state.unreadCount = action.payload
      })
      .addCase(fetchUnreadCountThunk.rejected, (state) => {
        state.unreadCount = 0
      })

    // ── Mark one read ────────────────────────────────────
    builder
      .addCase(markReadThunk.pending, (state) => {
        // optimistic update already applied via markOneRead reducer
      })
      .addCase(markReadThunk.fulfilled, (state, action) => {
        const item = state.items.find((n) => n.id === action.payload)
        if (item) item.read_at = new Date().toISOString()
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      })
      .addCase(markReadThunk.rejected, (state) => {
        // If API fails, the optimistic update stays. User can retry.
      })

    // ── Mark all read ────────────────────────────────────
    builder
      .addCase(markAllReadThunk.pending, (state) => {
        // optimistic update already applied via markAllReadLocal reducer
      })
      .addCase(markAllReadThunk.fulfilled, (state) => {
        state.items.forEach((n) => {
          if (!n.read_at) n.read_at = new Date().toISOString()
        })
        state.unreadCount = 0
      })
      .addCase(markAllReadThunk.rejected, (state) => {
        // If API fails, the optimistic update stays. User can retry.
      })
  },
})

export const { markOneRead, markAllReadLocal } = notificationSlice.actions
export default notificationSlice.reducer