import axiosInstance from './axiosInstance'
import { API } from '../constants/apiRoutes'

/**
 * Planning API service.
 *
 * Key response shapes:
 * - index()   → paginatedResponse: { data: [...], meta: {...} }
 * - store()   → successResponse:   { data: planning }
 * - update()  → successResponse:   { data: planning }
 * - destroy() → 204 noContent (response()->noContent())
 * - suggest() → successResponse:   { data: [{ employee, current_hours, match_percentage, rating }] }
 * - lock()    → successResponse:   { data: { week_number, year, locked_count } }
 * - generate()→ successResponse:   { data: { generated_count, week_number, year, planning, errors } }
 *
 * Conflict detection (422):
 * { errors: { planning: ['Employee already assigned...'] } }
 */
const planningService = {

  /**
   * GET /v1/planning
   * params: { week_number, year, team_id?, shift_id?, user_id?, is_locked? }
   */
  getAll: async (params = {}) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    )
    const res = await axiosInstance.get(API.PLANNING.LIST, { params: clean })
    return {
      data: res.data.data,
      meta: res.data.meta,
    }
  },

  /**
   * POST /v1/planning
   * body: { user_id, shift_id, date, team_id?, notes? }
   * Can throw 422 with { errors: { planning: [...] } } on conflict
   */
  create: async (data) => {
    const res = await axiosInstance.post(API.PLANNING.CREATE, data)
    return res.data.data
  },

  /**
   * PUT /v1/planning/{id}
   * Same fields as create — date rule is just 'required|date' on PUT (fix #4)
   */
  update: async (id, data) => {
    const res = await axiosInstance.put(API.PLANNING.UPDATE(id), data)
    return res.data.data
  },

  /**
   * DELETE /v1/planning/{id}
   * Returns 204 noContent — no response body
   */
  delete: async (id) => {
    await axiosInstance.delete(API.PLANNING.DELETE(id))
  },

  /**
   * POST /v1/planning/suggest
   * body: { shift_id, date, team_id? }
   * Returns array of suggestions (max 5, sorted by match_percentage desc)
   * Each: { employee: { id, name, initials, avatar }, current_hours,
   *         weekly_limit, rating, match_percentage }
   */
  suggest: async (params) => {
    const res = await axiosInstance.post(API.PLANNING.SUGGEST, params)
    return res.data.data
  },

  /**
   * POST /v1/planning/lock-current-week
   * Returns: { week_number, year, locked_count }
   */
  lockCurrentWeek: async () => {
    const res = await axiosInstance.post(API.PLANNING.LOCK_CURRENT)
    return res.data.data
  },

  /**
   * POST /v1/planning/generate-next-week
   * Returns: { generated_count, week_number, year, planning: [...], errors: [...] }
   */
  generateNextWeek: async () => {
    const res = await axiosInstance.post(API.PLANNING.GENERATE_NEXT)
    return res.data.data
  },

  /**
   * POST /v1/planning/override-lock
   * body: { planning_id }
   * Returns updated planning record
   */
  overrideLock: async (planningId) => {
    const res = await axiosInstance.post(API.PLANNING.OVERRIDE_LOCK, {
      planning_id: planningId,
    })
    return res.data.data
  },

  /**
   * POST /v1/planning/{id}/lock
   * Locks a single planning assignment.
   * Returns updated planning record
   */
  lockPlanning: async (id) => {
    const res = await axiosInstance.post(API.PLANNING.LOCK(id))
    return res.data.data
  },

  // ── BATCH OPERATIONS ──

  batchDelete: async (planningIds) => {
    const res = await axiosInstance.post(API.PLANNING.BATCH_DELETE, { planning_ids: planningIds })
    return res.data.data
  },

  batchUpdateShift: async ({ planning_ids, shift_id }) => {
    const res = await axiosInstance.post(API.PLANNING.BATCH_UPDATE_SHIFT, { planning_ids, shift_id })
    return res.data.data
  },

  batchAssignEmployee: async ({ planning_ids, user_id }) => {
    const res = await axiosInstance.post(API.PLANNING.BATCH_ASSIGN_EMPLOYEE, { planning_ids, user_id })
    return res.data.data
  },

  duplicateDay: async ({ source_date, target_date }) => {
    const res = await axiosInstance.post(API.PLANNING.BATCH_DUPLICATE_DAY, { source_date, target_date })
    return res.data.data
  },

  validateBatch: async (items) => {
    const res = await axiosInstance.post(API.PLANNING.BATCH_VALIDATE, { items })
    return res.data.data
  },
}

export default planningService