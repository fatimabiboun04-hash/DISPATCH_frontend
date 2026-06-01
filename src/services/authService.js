import axiosInstance from './axiosInstance'
import { API } from '../constants/apiRoutes'

/**
 * Auth API service.
 * All methods return the unwrapped data from the API response.
 */
const authService = {
  /**
   * POST /v1/login
   * Returns { token, user }
   */
  login: async ({ email, password }) => {
    const res = await axiosInstance.post(API.AUTH.LOGIN, {
      email,
      password,
      device_name: navigator.userAgent || 'web-browser',
    })
    return res.data.data
  },

  /**
   * POST /v1/logout
   */
  logout: async () => {
    const res = await axiosInstance.post(API.AUTH.LOGOUT)
    return res.data
  },
}

export default authService