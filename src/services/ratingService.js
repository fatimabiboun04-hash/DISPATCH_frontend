import axiosInstance from './axiosInstance'
import { API } from '../constants/apiRoutes'

const ratingService = {
  /**
   * POST /v1/ratings/rate/{employeeId}
   * Body: { score: 1-5, comment?: string }
   */
  rate: async (employeeId, { score, comment }) => {
    const res = await axiosInstance.post(API.RATINGS.RATE(employeeId), { score, comment })
    return res.data.data
  },

  /**
   * GET /v1/ratings/current/{employeeId}
   */
  getCurrent: async (employeeId) => {
    const res = await axiosInstance.get(API.RATINGS.CURRENT(employeeId))
    return res.data.data
  },

  /**
   * GET /v1/ratings/history/{employeeId}
   */
  getHistory: async (employeeId, params = {}) => {
    const res = await axiosInstance.get(API.RATINGS.HISTORY(employeeId), { params })
    return { data: res.data.data, meta: res.data.meta }
  },

  /**
   * GET /v1/ratings/stats
   */
  getStats: async () => {
    const res = await axiosInstance.get(API.RATINGS.STATS)
    return res.data.data
  },
}

export default ratingService