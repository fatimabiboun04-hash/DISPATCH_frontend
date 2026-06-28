export const selectTemplates = (state) => state.planningTemplates?.list || []
export const selectTemplatesLoading = (state) => state.planningTemplates?.loading || false
export const selectTemplatesCreating = (state) => state.planningTemplates?.creating || false
export const selectTemplatesError = (state) => state.planningTemplates?.error || null
export const selectLoadResult = (state) => state.planningTemplates?.loadResult || null
export const selectLoadErrors = (state) => state.planningTemplates?.loadErrors || []
export const selectLoadLoading = (state) => state.planningTemplates?.loadLoading || false
