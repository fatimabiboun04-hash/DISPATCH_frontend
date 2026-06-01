import axiosInstance from './axiosInstance'
import { API } from '../constants/apiRoutes'

/**
 * Team API service.
 *
 * Response unwrapping:
 *   index/store/show/update → res.data.data  (successResponse or paginatedResponse)
 *   destroy → 204 No Content (no body)
 *   assign/remove → res.data.data (updated team with users[])
 */
const teamService = {

  /**
   * GET /v1/teams
   * Returns paginatedResponse: { data: [...teams], meta }
   */
  getAll: async (params = {}) => {
    const res = await axiosInstance.get(API.TEAMS.LIST, { params })
    return {
      data: res.data.data,
      meta: res.data.meta,
    }
  },

  /**
   * GET /v1/teams/{id}
   * Returns team with users.skills loaded
   */
  getOne: async (id) => {
    const res = await axiosInstance.get(API.TEAMS.SHOW(id))
    return res.data.data
  },

  /**
   * POST /v1/teams
   * Body: { name, description?, color?, leader_id? }
   */
  create: async (data) => {
    const res = await axiosInstance.post(API.TEAMS.CREATE, data)
    return res.data.data
  },

  /**
   * PUT /v1/teams/{id}
   */
  update: async (id, data) => {
    const res = await axiosInstance.put(API.TEAMS.UPDATE(id), data)
    return res.data.data
  },

  /**
   * DELETE /v1/teams/{id}
   * Returns 204 — no body
   */
  delete: async (id) => {
    await axiosInstance.delete(API.TEAMS.DELETE(id))
  },

  /**
   * POST /v1/teams/{team}/assign
   * Body: { user_id }
   * Uses syncWithoutDetaching — only adds, never removes others
   * Returns updated team with users[]
   */
  assignEmployee: async (teamId, userId) => {
    const res = await axiosInstance.post(
      API.TEAMS.ASSIGN(teamId),
      { user_id: userId }
    )
    return res.data.data
  },

  /**
   * DELETE /v1/teams/{team}/remove/{user}
   * Returns updated team with users[]
   */
  removeEmployee: async (teamId, userId) => {
    const res = await axiosInstance.delete(
      API.TEAMS.REMOVE(teamId, userId)
    )
    return res.data.data
  },
}

export default teamService