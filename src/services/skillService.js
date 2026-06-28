import axiosInstance from './axiosInstance'
import { API } from '../constants/apiRoutes'

const skillService = {
  getAll: async () => {
    const res = await axiosInstance.get(API.SKILLS.LIST)
    return res.data.data
  },

  create: async (data) => {
    const res = await axiosInstance.post(API.SKILLS.CREATE, data)
    return res.data.data
  },

  update: async (id, data) => {
    const res = await axiosInstance.put(API.SKILLS.UPDATE(id), data)
    return res.data.data
  },

  delete: async (id) => {
    const res = await axiosInstance.delete(API.SKILLS.DELETE(id))
    return res.data
  },
}

export default skillService
