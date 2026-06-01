import axiosInstance from './axiosInstance'
import { API } from '../constants/apiRoutes'

const ratingService = {
  /**
   * POST /v1/ratings/toggle/{employeeId}
   * Body: { reason?: string }
   * Returns: { rating, type, icon, message }
   */
  toggle: async (employeeId, reason) => {
    const res = await axiosInstance.post(
      API.RATINGS.TOGGLE(employeeId),
      reason ? { reason } : {}
    )
    return res.data.data
  },

  /**
   * GET /v1/ratings/current/{employeeId}
   * Returns: { has_rating, type, icon, reason, week_number, year }
   */
  getCurrent: async (employeeId) => {
    const res = await axiosInstance.get(API.RATINGS.CURRENT(employeeId))
    return res.data.data
  },

  /**
   * GET /v1/ratings/history/{employeeId}
   * Returns paginatedResponse
   */
  getHistory: async (employeeId, params = {}) => {
    const res = await axiosInstance.get(API.RATINGS.HISTORY(employeeId), { params })
    return { data: res.data.data, meta: res.data.meta }
  },
}

export default ratingService