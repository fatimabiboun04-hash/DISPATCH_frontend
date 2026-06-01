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
}

export default pauseService