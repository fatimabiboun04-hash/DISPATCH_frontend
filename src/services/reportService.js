import axiosInstance from './axiosInstance'
import { API } from '../constants/apiRoutes'

/**
 * Report API service.
 *
 * Key response shapes:
 * - index()    → paginatedResponse: { data:[...with generator], meta }
 * - generate() → successResponse 202: { data: report (status: 'queued') }
 * - download() → binary file response (Storage::download)
 *               MUST use responseType: 'blob'
 *               Returns 422 if not completed
 *               Returns 404 if file missing on disk
 *
 * Report fields: id, type, start_date, end_date, file_type, status,
 *                week_number?, year?, file_path?,
 *                generator: { id, name, email }
 *
 * Status values handled: 'queued' | 'processing' | 'completed' | 'failed'
 * (fix #7 noted — original enum missing 'queued', patched migration exists)
 */
const reportService = {

  /**
   * GET /v1/reports
   * Returns paginatedResponse (paginate 15), loads generator.
   */
  getAll: async (params = {}) => {
    const res = await axiosInstance.get(API.REPORTS.LIST, { params })
    return { data: res.data.data, meta: res.data.meta }
  },

  /**
   * POST /v1/reports
   * Body: { type, start_date, end_date, file_type }
   * Returns 202 — report created and queued for generation.
   */
  generate: async (data) => {
    const res = await axiosInstance.post(API.REPORTS.CREATE, data)
    return res.data.data
  },

  /**
   * GET /v1/reports/{id}/download
   * Returns binary blob — Storage::download().
   * MUST use responseType: 'blob' otherwise the binary data is corrupted.
   * Returns 422 if status !== 'completed'.
   * Returns 404 if file not on disk.
   */
  download: async (id) => {
    const res = await axiosInstance.get(API.REPORTS.DOWNLOAD(id), {
      responseType: 'blob',
    })
    return res.data  // Blob object
  },
}

export default reportService