import axiosInstance from './axiosInstance'
import { API } from '../constants/apiRoutes'

/**
 * Dashboard API service.
 * All methods unwrap res.data.data — the payload from ApiResponse::successResponse().
 *
 * Backend wrapper: { success: true, data: <payload>, message: string }
 * We always return the inner `data` field.
 */
const dashboardService = {
  /**
   * GET /v1/dashboard/stats
   * Returns: { coverage:{percentage,active,total}, delays_today,
   *            pending_leaves, flagged_pointages, today_assignments,
   *            current_week, current_year }
   */
  getStats: async () => {
    const res = await axiosInstance.get(API.DASHBOARD.STATS)
    return res.data.data
  },

  /**
   * GET /v1/dashboard/live-feed
   * Returns: array of { type, user_name, user_initials, time, status,
   *                     is_flagged, date_range? }
   */
  getLiveFeed: async () => {
    const res = await axiosInstance.get(API.DASHBOARD.LIVE_FEED)
    return res.data.data
  },

  /**
   * GET /v1/dashboard/coverage
   * Returns: array of 7 { date, day_name, assigned, checked_in, coverage }
   */
  getCoverage: async () => {
    const res = await axiosInstance.get(API.DASHBOARD.COVERAGE)
    return res.data.data
  },

  /**
   * GET /v1/dashboard/active-pauses
   * Returns: { count: number, pauses: array }
   */
  getActivePauses: async () => {
    const res = await axiosInstance.get(API.DASHBOARD.ACTIVE_PAUSES)
    return res.data.data
  },
}

export default dashboardService