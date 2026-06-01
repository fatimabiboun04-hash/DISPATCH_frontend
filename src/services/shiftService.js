import axiosInstance from './axiosInstance'
import { API } from '../constants/apiRoutes'

/**
 * Shift API service.
 *
 * IMPORTANT response shapes:
 * - index()    → successResponse (plain array, NO meta/pagination)
 *               res.data.data = [...shifts]
 * - store()    → successResponse, res.data.data = shift object
 * - update()   → successResponse, res.data.data = shift object
 * - destroy()  → successResponse(null) — NOT 204.
 *               ShiftController@destroy deactivates, does not delete.
 *
 * Shift start_time / end_time returned as 'HH:mm' strings
 * (cast as datetime:H:i in model).
 */
const shiftService = {

  /**
   * GET /v1/shifts
   * Returns plain array ordered by start_time.
   * No pagination — returns all shifts at once.
   */
  getAll: async () => {
    const res = await axiosInstance.get(API.SHIFTS.LIST)
    return res.data.data  // plain array
  },

  /**
   * POST /v1/shifts
   * Body: { name, type, start_time, end_time, break_minutes?, color?, is_active? }
   * type is required (fix #12) — enum: day|night|conge|absence|emergency
   */
  create: async (data) => {
    const res = await axiosInstance.post(API.SHIFTS.CREATE, data)
    return res.data.data
  },

  /**
   * PUT /v1/shifts/{id}
   * All fields optional (sometimes validation)
   */
  update: async (id, data) => {
    const res = await axiosInstance.put(API.SHIFTS.UPDATE(id), data)
    return res.data.data
  },

  /**
   * DELETE /v1/shifts/{id}
   * Does NOT hard-delete — sets is_active = false
   * Returns successResponse(null, 'Shift deactivated')
   */
  deactivate: async (id) => {
    const res = await axiosInstance.delete(API.SHIFTS.DELETE(id))
    return res.data  // { success: true, data: null, message: 'Shift deactivated' }
  },
}

export default shiftService