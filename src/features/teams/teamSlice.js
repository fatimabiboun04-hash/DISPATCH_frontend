import { createSlice } from '@reduxjs/toolkit'
import {
  fetchTeamsThunk,
  fetchTeamThunk,
  createTeamThunk,
  updateTeamThunk,
  deleteTeamThunk,
  assignEmployeeThunk,
  removeEmployeeThunk,
} from './teamThunks'

/**
 * Teams state.
 *
 * list   → all teams (GET /v1/teams) — paginatedResponse
 * detail → single team with users.skills (GET /v1/teams/{id})
 *
 * Backend: TeamController
 * - index()  → Team::with(['users','leader'])->paginate(15)
 * - show()   → $team->load(['users.skills','leader'])
 * - assign() → syncWithoutDetaching (ADD only)
 * - remove() → detach (REMOVE one)
 */
const initialState = {
  list:        [],
  meta:        null,
  listLoading: false,
  listError:   null,

  detail:        null,
  detailLoading: false,
  detailError:   null,

  submitting:  false,
  submitError: null,
}

const teamSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    clearDetail: (state) => {
      state.detail      = null
      state.detailError = null
    },
    clearSubmitError: (state) => {
      state.submitError = null
    },
  },
  extraReducers: (builder) => {

    // ── Fetch list ─────────────────────────────────────────
    builder
      .addCase(fetchTeamsThunk.pending, (state) => {
        state.listLoading = true
        state.listError   = null
      })
      .addCase(fetchTeamsThunk.fulfilled, (state, action) => {
        state.listLoading = false
        state.list        = action.payload.data
        state.meta        = action.payload.meta
      })
      .addCase(fetchTeamsThunk.rejected, (state, action) => {
        state.listLoading = false
        state.listError   = action.payload
      })

    // ── Fetch single ───────────────────────────────────────
    builder
      .addCase(fetchTeamThunk.pending, (state) => {
        state.detailLoading = true
        state.detailError   = null
      })
      .addCase(fetchTeamThunk.fulfilled, (state, action) => {
        state.detailLoading = false
        state.detail        = action.payload
      })
      .addCase(fetchTeamThunk.rejected, (state, action) => {
        state.detailLoading = false
        state.detailError   = action.payload
      })

    // ── Create ─────────────────────────────────────────────
    builder
      .addCase(createTeamThunk.pending, (state) => {
        state.submitting  = true
        state.submitError = null
      })
      .addCase(createTeamThunk.fulfilled, (state, action) => {
        state.submitting = false
        // Prepend new team to list
        state.list.unshift(action.payload)
        if (state.meta) state.meta.total += 1
      })
      .addCase(createTeamThunk.rejected, (state, action) => {
        state.submitting  = false
        state.submitError = action.payload
      })

    // ── Update ─────────────────────────────────────────────
    builder
      .addCase(updateTeamThunk.pending, (state) => {
        state.submitting  = true
        state.submitError = null
      })
      .addCase(updateTeamThunk.fulfilled, (state, action) => {
        state.submitting = false
        const idx = state.list.findIndex((t) => t.id === action.payload.id)
        if (idx >= 0) state.list[idx] = action.payload
        if (state.detail?.id === action.payload.id) {
          // Preserve users.skills from detail since update response
          // only loads(['users','leader']), not users.skills
          state.detail = { ...state.detail, ...action.payload }
        }
      })
      .addCase(updateTeamThunk.rejected, (state, action) => {
        state.submitting  = false
        state.submitError = action.payload
      })

    // ── Delete ─────────────────────────────────────────────
    builder
      .addCase(deleteTeamThunk.fulfilled, (state, action) => {
        state.list = state.list.filter((t) => t.id !== action.payload)
        if (state.meta) state.meta.total -= 1
      })

    // ── Assign employee ────────────────────────────────────
    // assignEmployee returns updated team with users[]
    builder
      .addCase(assignEmployeeThunk.pending, (state) => {
        state.submitting  = true
        state.submitError = null
      })
      .addCase(assignEmployeeThunk.fulfilled, (state, action) => {
        state.submitting = false
        // Update team in list with fresh users
        const idx = state.list.findIndex((t) => t.id === action.payload.id)
        if (idx >= 0) state.list[idx] = action.payload
        // Update detail if open
        if (state.detail?.id === action.payload.id) {
          state.detail = { ...state.detail, users: action.payload.users }
        }
      })
      .addCase(assignEmployeeThunk.rejected, (state, action) => {
        state.submitting  = false
        state.submitError = action.payload
      })

    // ── Remove employee ────────────────────────────────────
    builder
      .addCase(removeEmployeeThunk.pending, (state) => {
        state.submitting  = true
        state.submitError = null
      })
      .addCase(removeEmployeeThunk.fulfilled, (state, action) => {
        state.submitting = false
        const idx = state.list.findIndex((t) => t.id === action.payload.id)
        if (idx >= 0) state.list[idx] = action.payload
        if (state.detail?.id === action.payload.id) {
          state.detail = { ...state.detail, users: action.payload.users }
        }
      })
      .addCase(removeEmployeeThunk.rejected, (state, action) => {
        state.submitting  = false
        state.submitError = action.payload
      })
  },
})

export const { clearDetail, clearSubmitError } = teamSlice.actions
export default teamSlice.reducer