import axiosInstance from './axiosInstance'
import { API } from '../constants/apiRoutes'

/**
 * Device API service.
 *
 * Device model fields: id, user_id, fingerprint, name,
 *   is_trusted, trusted_at, last_used_at
 *
 * NOTE: NO browser, os, or ip_address columns in migration.
 * The `name` field contains the device name/user-agent string.
 *
 * trust/untrust return: successResponse($device->load('user'))
 * Both use POST method (not PATCH/PUT).
 */
const deviceService = {

  /**
   * GET /v1/devices (admin only)
   * Returns paginatedResponse (paginate 20) with user loaded.
   */
  getAll: async (params = {}) => {
    const res = await axiosInstance.get(API.DEVICES.LIST, { params })
    return { data: res.data.data, meta: res.data.meta }
  },

  /**
   * POST /v1/devices/{id}/trust
   * Returns updated device with user loaded.
   */
  trust: async (id) => {
    const res = await axiosInstance.post(API.DEVICES.TRUST(id))
    return res.data.data
  },

  /**
   * POST /v1/devices/{id}/untrust
   * Returns updated device with user loaded.
   */
  untrust: async (id) => {
    const res = await axiosInstance.post(API.DEVICES.UNTRUST(id))
    return res.data.data
  },
}

export default deviceService