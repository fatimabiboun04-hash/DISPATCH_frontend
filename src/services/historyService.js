import axiosInstance from './axiosInstance'
import { API }       from '../constants/apiRoutes'
import {
  getISOWeek, getISOWeekYear,
  startOfISOWeek, endOfISOWeek,
  subWeeks, format,
} from 'date-fns'
import { fr } from 'date-fns/locale'

/**
 * History service.
 *
 * Uses existing endpoints — no dedicated history API.
 *
 * Audit logs:    GET /v1/audit-logs
 * Leave history: GET /v1/leave-requests (admin, with status filter)
 * Weekly history: built by fetching GET /v1/planning for past N weeks
 *
 * AuditLog fields: action, entity_type, entity_id, old_values(array),
 *   new_values(array), ip_address, user_agent, created_at, user
 * entity_type stored as Laravel class name:
 *   'App\\Models\\User', 'App\\Models\\Planning', etc.
 */
const historyService = {

  /**
   * GET /v1/audit-logs
   * Supports: action, entity_type, user_id, date_from, date_to, page
   */
  getAuditLogs: async (params = {}) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    )
    const res = await axiosInstance.get(API.AUDIT.LIST, { params: clean })
    return { data: res.data.data, meta: res.data.meta }
  },

  /**
   * GET /v1/leave-requests for history view.
   * Fetches all leave requests — admin can see all statuses for history.
   */
  getLeaveHistory: async (params = {}) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    )
    const res = await axiosInstance.get(API.LEAVE.LIST, { params: clean })
    return { data: res.data.data, meta: res.data.meta }
  },

  /**
   * Build weekly history by fetching planning counts for past N weeks.
   * Returns array of { week_number, year, weekLabel, weekStart, weekEnd,
   *                    planning_count }
   * sorted most recent first.
   *
   * No dedicated backend endpoint — uses GET /v1/planning per week.
   * We only fetch planning count (meta.total) per week to avoid heavy data.
   */
  getWeeklyHistory: async (weeksBack = 8) => {
    const now    = new Date()
    const weeks  = []

    // Build list of past weeks to fetch
    for (let i = 1; i <= weeksBack; i++) {
      const weekDate  = subWeeks(now, i)
      const weekNum   = getISOWeek(weekDate)
      const year      = getISOWeekYear(weekDate)
      const weekStart = startOfISOWeek(weekDate)
      const weekEnd   = endOfISOWeek(weekDate)
      weeks.push({ weekNum, year, weekStart, weekEnd })
    }

    // Fetch planning data for all weeks in parallel
    const results = await Promise.allSettled(
      weeks.map(({ weekNum, year }) =>
        axiosInstance.get(API.PLANNING.LIST, {
          params: { week_number: weekNum, year, per_page: 1 },
        })
      )
    )

    return weeks.map(({ weekNum, year, weekStart, weekEnd }, i) => {
      const result = results[i]
      const total  = result.status === 'fulfilled'
        ? (result.value.data.meta?.total || 0)
        : 0

      const label = `S${weekNum} · ${format(weekStart, 'd MMM', { locale: fr })} – ${format(weekEnd, 'd MMM yyyy', { locale: fr })}`

      return {
        week_number:    weekNum,
        year,
        weekLabel:      label,
        weekStart:      format(weekStart, 'yyyy-MM-dd'),
        weekEnd:        format(weekEnd,   'yyyy-MM-dd'),
        planning_count: total,
      }
    })
  },
}

export default historyService