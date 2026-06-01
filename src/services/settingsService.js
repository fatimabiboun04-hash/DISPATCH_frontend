import axiosInstance from './axiosInstance'
import { API } from '../constants/apiRoutes'

/**
 * Settings API service.
 *
 * CRITICAL response shape:
 * GET /v1/settings → successResponse($settings)
 *   where $settings = Setting::all()->groupBy('group')
 *   res.data.data = { general: [...], gps: [...], planning: [...] }
 *
 * Each setting: { id, key, value: <JSON_OBJECT>, group, created_at, updated_at }
 * value is ALWAYS an object — never a scalar directly.
 *   Scalar stored as: { value: scalar }
 *   Object stored as: { lat: .., lng: .., radius_meters: .. }
 *
 * PUT /v1/settings body:
 *   { settings: [{ key, value, group }] }
 *   - value must be the full JSON object (NOT wrapped)
 *   Backend wraps scalars: is_array($v) ? $v : ['value' => $v]
 *   So if we pass { value: 15 } the backend stores { value: { value: 15 } }
 *   We must always pass objects: { minutes: 15 } not 15
 *
 * Returns same grouped structure as GET.
 */
const settingsService = {

  /**
   * GET /v1/settings
   * Returns grouped settings object.
   */
  getAll: async () => {
    const res = await axiosInstance.get(API.SETTINGS.GET)
    return res.data.data  // { general: [...], gps: [...], ... }
  },

  /**
   * PUT /v1/settings
   * settingsArray: [{ key, value (object), group }]
   * Returns updated grouped settings.
   */
  update: async (settingsArray) => {
    const res = await axiosInstance.put(API.SETTINGS.UPDATE, {
      settings: settingsArray,
    })
    return res.data.data
  },
}

export default settingsService