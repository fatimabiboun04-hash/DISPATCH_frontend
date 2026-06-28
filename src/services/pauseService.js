import axiosInstance from './axiosInstance'
import { API } from '../constants/apiRoutes'

/**
 * Pause API service.
 *
 * Key response notes:
 * - store (single user) → successResponse(pause.load(['user','planning.shift']), 201)
 *   res.data.data = one pause object
 * - store (team)        → successResponse(pauses_array, 201)
 *   res.data.data = array of pauses (no relations loaded)
 * - update              → successResponse(pause.load(['user','planning.shift']))
 *   res.data.data = one pause object
 * - destroy             → successResponse(null, 'Pause deleted', 204)
 *   res.data.data = null  (NOT 204 noContent — has JSON body)
 * - byPlanning          → successResponse(array via getByPlanning())
 *   res.data.data = array with user + team loaded
 *
 * pause_start / pause_end: sent and received as 'HH:mm' strings
 */
const pauseService = {

  /**
   * GET /v1/pauses/planning/{planningId}
   * Returns array of pauses for this planning with user + team.
   */
  getByPlanning: async (planningId) => {
    const res = await axiosInstance.get(API.PAUSES.BY_PLANNING(planningId))
    return res.data.data  // plain array
  },

  /**
   * GET /v1/pauses/batch?planning_ids=1,2,3
   * Returns { [planningId]: [...pauses] } grouped by planning_id.
   */
  batchGetByPlanning: async (planningIds) => {
    const res = await axiosInstance.get(API.PAUSES.BATCH, {
      params: { planning_ids: planningIds.join(',') },
    })
    return res.data.data  // { [planningId]: [...] }
  },

  /**
   * POST /v1/pauses
   * For single user: { planning_id, pause_start, pause_end, user_id }
   * For team:        { planning_id, pause_start, pause_end, team_id }
   * Returns: one pause object OR array of pauses
   */
  create: async (data) => {
    const res = await axiosInstance.post(API.PAUSES.CREATE, data)
    return res.data.data
  },

  /**
   * PUT /v1/pauses/{id}
   * Body: { pause_start: 'HH:mm', pause_end: 'HH:mm' }
   * Only updates time window — user/planning cannot change.
   */
  update: async (id, data) => {
    const res = await axiosInstance.put(API.PAUSES.UPDATE(id), data)
    return res.data.data
  },

  /**
   * DELETE /v1/pauses/{id}
   * Returns successResponse(null) with JSON body — not 204.
   */
  delete: async (id) => {
    const res = await axiosInstance.delete(API.PAUSES.DELETE(id))
    return res.data  // { success: true, data: null, message: 'Pause deleted' }
  },

  /**
   * POST /v1/me/pauses/start — employee self-start pause
   */
  startMyPause: async () => {
    const res = await axiosInstance.post(API.PAUSES.START_MY)
    return res.data.data
  },

  /**
   * POST /v1/me/pauses/stop — employee self-stop pause
   */
  stopMyPause: async () => {
    const res = await axiosInstance.post(API.PAUSES.STOP_MY)
    return res.data.data
  },
}

export default pauseService