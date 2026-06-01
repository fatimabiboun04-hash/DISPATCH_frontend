import axiosInstance from './axiosInstance'
import { API } from '../constants/apiRoutes'

/**
 * Employee API service.
 * All responses unwrap res.data (paginatedResponse or successResponse).
 *
 * paginatedResponse → { data: [...], meta: { current_page, last_page, per_page, total } }
 * successResponse   → { data: <payload> }
 */
const employeeService = {

  /**
   * GET /v1/employees
   * params: { search, team_id, status, page }
   * Returns paginatedResponse shape
   */
  getAll: async (params = {}) => {
    // Remove empty string params to avoid sending empty filters
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    )
    const res = await axiosInstance.get(API.EMPLOYEES.LIST, { params: clean })
    return {
      data: res.data.data,
      meta: res.data.meta,
    }
  },

  /**
   * GET /v1/employees/{id}
   * Returns employee with teams, skills, ratings (last 10)
   */
  getOne: async (id) => {
    const res = await axiosInstance.get(API.EMPLOYEES.SHOW(id))
    return res.data.data
  },

  /**
   * POST /v1/employees
   */
  create: async (data) => {
    const res = await axiosInstance.post(API.EMPLOYEES.CREATE, data)
    return res.data.data
  },

  /**
   * PUT /v1/employees/{id}
   */
  update: async (id, data) => {
    const res = await axiosInstance.put(API.EMPLOYEES.UPDATE(id), data)
    return res.data.data
  },

  /**
   * DELETE /v1/employees/{id}
   * Returns 204 No Content — no body to unwrap
   */
  delete: async (id) => {
    await axiosInstance.delete(API.EMPLOYEES.DELETE(id))
  },

  /**
   * GET /v1/employees/{id}/history
   * Returns { data: [...timeline events], total, per_page, current_page }
   */
  getHistory: async (id, params = {}) => {
    const res = await axiosInstance.get(API.EMPLOYEES.HISTORY(id), { params })
    return res.data.data
  },

  /**
   * GET /v1/employees/{id}/planning
   */
  getPlanning: async (id, params = {}) => {
    const res = await axiosInstance.get(API.EMPLOYEES.PLANNING(id), { params })
    return {
      data: res.data.data,
      meta: res.data.meta,
    }
  },

  /**
   * GET /v1/employees/{id}/pointages
   */
  getPointages: async (id, params = {}) => {
    const res = await axiosInstance.get(API.EMPLOYEES.POINTAGES(id), { params })
    return {
      data: res.data.data,
      meta: res.data.meta,
    }
  },
}

export default employeeService