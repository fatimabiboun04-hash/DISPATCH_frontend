import axiosInstance from './axiosInstance'
import { API } from '../constants/apiRoutes'

/**
 * Leave Request API service.
 *
 * Response shapes:
 * - index()      → paginatedResponse: { data:[...with user], meta }
 * - store()      → successResponse: leave.load('user') + 201
 *                  422 on date overlap: 'You already have approved leave in this date range'
 * - approve()    → successResponse: leaveRequest.load(['user','approver'])
 *                  422 if already processed: 'Leave request already processed'
 * - reject()     → successResponse: leaveRequest.load(['user','approver'])
 *                  422 if already processed
 * - myRequests() → paginatedResponse: { data:[...no relations], meta }
 *
 * Date fields: start_date, end_date → 'YYYY-MM-DD' (date cast in model)
 */
const leaveService = {

  /**
   * GET /v1/leave-requests (admin)
   * Filters: status?, user_id?
   */
  getAll: async (params = {}) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    )
    const res = await axiosInstance.get(API.LEAVE.LIST, { params: clean })
    return { data: res.data.data, meta: res.data.meta }
  },

  /**
   * POST /v1/leave-requests (employee — gap fix #1)
   * Body: { start_date, end_date, reason, type }
   * type enum: annual|sick|emergency|unpaid
   */
  submit: async (data) => {
    const res = await axiosInstance.post(API.LEAVE.CREATE, data)
    return res.data.data
  },

  /**
   * POST /v1/leave-requests/{id}/approve (admin)
   *
   * New behavior:
   * - If employee has planning conflicts, returns 422 with requires_force
   * - Second call with { force: true } removes planning and approves
   *
   * On success returns: { leave_request, planning_removed, replacement_suggestions }
   * On conflict returns 422 with: { has_conflicts, requires_force, conflicts, conflict_count }
   */
  approve: async (id, options = {}) => {
    const body = {}
    if (options.force) body.force = true
    const res = await axiosInstance.post(API.LEAVE.APPROVE(id), body)
    return res.data.data
  },

  /**
   * POST /v1/leave-requests/{id}/reject (admin)
   * Body: { rejection_reason: required string }
   */
  reject: async (id, rejection_reason) => {
    const res = await axiosInstance.post(API.LEAVE.REJECT(id), {
      rejection_reason,
    })
    return res.data.data
  },

  /**
   * GET /v1/me/leave-requests (employee)
   */
  getMine: async (params = {}) => {
    const res = await axiosInstance.get(API.ME.LEAVE_REQUESTS, { params })
    return { data: res.data.data, meta: res.data.meta }
  },
}

export default leaveService