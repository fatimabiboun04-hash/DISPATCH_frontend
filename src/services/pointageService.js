import axiosInstance from './axiosInstance'
import { API } from '../constants/apiRoutes'

/**
 * Pointage API service.
 *
 * CRITICAL: checkIn uses FormData (multipart/form-data) because
 * CheckInRequest accepts an optional `selfie` image file.
 * Even without a selfie, we must send all fields as FormData
 * so the backend can read them properly.
 *
 * All other methods use JSON.
 */
const pointageService = {

  /**
   * POST /v1/pointages/check-in
   * Sends FormData: latitude, longitude, device_fingerprint, selfie?
   * Returns: { pointage, status, delay_minutes, is_flagged, message }
   */
  checkIn: async ({ latitude, longitude, deviceFingerprint, selfie = null }) => {
    const formData = new FormData()
    formData.append('latitude',           String(latitude))
    formData.append('longitude',          String(longitude))
    formData.append('device_fingerprint', deviceFingerprint)
    if (selfie) {
      formData.append('selfie', selfie)
    }

    const deviceName = `${navigator.platform || 'Unknown'} - ${navigator.userAgent?.slice(0, 40) || 'Browser'}`
    const res = await axiosInstance.post(API.POINTAGE.CHECK_IN, formData, {
      headers: { 'Content-Type': 'multipart/form-data', 'X-Device-Name': deviceName },
    })
    return res.data.data
  },

  /**
   * POST /v1/pointages/check-out
   * No body needed — backend finds open pointage for user.
   * Returns: { pointage, worked_hours, pause_deducted,
   *            early_leave_minutes, overtime_minutes, status }
   */
  checkOut: async () => {
    const res = await axiosInstance.post(API.POINTAGE.CHECK_OUT)
    return res.data.data
  },

  /**
   * GET /v1/me/pointages
   * Returns paginatedResponse (paginate 15) with gpsLog loaded.
   */
  getMyPointages: async (params = {}) => {
    const res = await axiosInstance.get(API.ME.POINTAGES, { params })
    return { data: res.data.data, meta: res.data.meta }
  },

  /**
   * GET /v1/pointages/flagged (admin only — fix #1 applied)
   * Returns paginatedResponse with user, planning.shift, gpsLog.
   * Only unverified: is_flagged=true AND verified_by=null
   */
  getFlagged: async (params = {}) => {
    const res = await axiosInstance.get(API.POINTAGE.FLAGGED, { params })
    return { data: res.data.data, meta: res.data.meta }
  },

  /**
   * POST /v1/pointages/{id}/verify (admin)
   * Body: { is_valid: boolean, notes?: string }
   * Returns pointage with user + verifier loaded
   */
  verifyFlag: async (id, data) => {
    const res = await axiosInstance.post(API.POINTAGE.VERIFY(id), data)
    return res.data.data
  },

  /**
   * GET /v1/pointage/absent-today (admin)
   * Returns: { absent_count, total_planned, absent_employees[] }
   */
  getAbsentToday: async () => {
    const res = await axiosInstance.get(API.POINTAGE.ABSENT_TODAY)
    return res.data.data
  },

  /**
   * GET /v1/pointage/replacement-suggestion/{planningId}
   * Returns: { planning_id, original_employee, suggestions[] }
   */
  getReplacementSuggestion: async (planningId) => {
    const res = await axiosInstance.get(API.POINTAGE.REPLACEMENT(planningId))
    return res.data.data
  },

  assignReplacement: async (planningId, replacementUserId) => {
    const res = await axiosInstance.post(API.POINTAGE.ASSIGN_REPLACEMENT(planningId), {
      replacement_user_id: replacementUserId,
    })
    return res.data.data
  },
}

export default pointageService