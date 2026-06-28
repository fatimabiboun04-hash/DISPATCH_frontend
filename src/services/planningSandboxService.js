import axiosInstance from './axiosInstance'
import { API } from '../constants/apiRoutes'

const planningSandboxService = {
  generate: async ({ week_number, year, session_id }) => {
    const res = await axiosInstance.post(API.PLANNING.SANDBOX_GENERATE, {
      week_number, year, session_id,
    })
    return res.data.data
  },

  preview: async (sessionId) => {
    const res = await axiosInstance.post(API.PLANNING.SANDBOX_PREVIEW, {
      session_id: sessionId,
    })
    return res.data.data
  },

  accept: async (sessionId) => {
    const res = await axiosInstance.post(API.PLANNING.SANDBOX_ACCEPT, {
      session_id: sessionId,
    })
    return res.data.data
  },

  cancel: async (sessionId) => {
    await axiosInstance.post(API.PLANNING.SANDBOX_CANCEL, {
      session_id: sessionId,
    })
  },
}

export default planningSandboxService
