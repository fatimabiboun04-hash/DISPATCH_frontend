import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import searchService from '../../services/searchService'

export const globalSearchThunk = createAsyncThunk(
  'search/globalSearch',
  async ({ query, signal }, { rejectWithValue }) => {
    try {
      const data = await searchService.globalSearch(query, signal)
      return { query, data }
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        return rejectWithValue('cancelled')
      }
      return rejectWithValue(err?.response?.data?.message || 'Search failed')
    }
  },
  {
    condition: ({ query }) => {
      if (!query || query.trim().length < 2) return false
    },
  }
)

const RECENT_KEY = 'dispatch_global_search_recent'
const MAX_RECENT = 10

const loadRecent = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
  } catch {
    return []
  }
}

const saveRecent = (items) => {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(items))
  } catch { /* quota exceeded */ }
}

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    results: [],
    loading: false,
    error: null,
    recentSearches: loadRecent(),
  },
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload
    },
    clearSearch: (state) => {
      state.query = ''
      state.results = []
      state.error = null
      state.loading = false
    },
    addRecentSearch: (state, action) => {
      const q = action.payload.trim()
      if (!q) return
      const items = state.recentSearches.filter(
        (item) => item.query.toLowerCase() !== q.toLowerCase()
      )
      items.unshift({ query: q, timestamp: Date.now() })
      state.recentSearches = items.slice(0, MAX_RECENT)
      saveRecent(state.recentSearches)
    },
    clearRecentSearches: (state) => {
      state.recentSearches = []
      localStorage.removeItem(RECENT_KEY)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(globalSearchThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(globalSearchThunk.fulfilled, (state, action) => {
        state.loading = false
        state.query = action.payload.query
        state.results = action.payload.data
      })
      .addCase(globalSearchThunk.rejected, (state, action) => {
        state.loading = false
        if (action.payload !== 'cancelled') {
          state.error = action.payload
        }
      })
  },
})

export const { setQuery, clearSearch, addRecentSearch, clearRecentSearches } = searchSlice.actions
export default searchSlice.reducer
