import axiosInstance from './axiosInstance'
import { API } from '../constants/apiRoutes'

/**
 * Profile service — for the logged-in user's own profile.
 *
 * GET /v1/me → ProfileController@show
 * Returns: { profile, stats, current_rating }
 *
 * PUT /v1/me → ProfileController@update
 * Uses FormData for avatar upload.
 * Returns: successResponse($user->fresh()->load('teams'))
 *   NOTE: response only has 'data' (the user) — not the full profile shape.
 *
 * Fix #4: avatar stored on 'public' disk (if fix applied).
 * Fix #16: tenure + monthly_hours added (if fix applied).
 * Frontend handles both old and new response defensively.
 */
const profileService = {

  /**
   * GET /v1/me
   */
  getProfile: async () => {
    const res = await axiosInstance.get(API.ME.PROFILE)
    return res.data.data  // { profile, stats, current_rating }
  },

  /**
   * PUT /v1/me
   * Sends FormData to support avatar file upload.
   * Fields: name, phone, description, avatar(file)?,
   *         current_password?, password?, password_confirmation?
   */
  updateProfile: async (data) => {
    const formData = new FormData()

    if (data.name)        formData.append('name',        data.name)
    if (data.phone)       formData.append('phone',       data.phone)
    if (data.description) formData.append('description', data.description)
    if (data.avatar instanceof File) {
      formData.append('avatar', data.avatar)
    }
    if (data.password) {
      formData.append('current_password',      data.current_password)
      formData.append('password',              data.password)
      formData.append('password_confirmation', data.password_confirmation)
    }

    // Laravel needs method spoofing for PUT with FormData
    formData.append('_method', 'PUT')

    const res = await axiosInstance.post(API.ME.PROFILE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },
}

export default profileService