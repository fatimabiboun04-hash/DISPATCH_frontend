export const selectStatsData = (state) => state.planningStats?.data || null
export const selectStatsLoading = (state) => state.planningStats?.loading || false
export const selectStatsError = (state) => state.planningStats?.error || null
