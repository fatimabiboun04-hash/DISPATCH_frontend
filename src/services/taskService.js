import axiosInstance from './axiosInstance'
import { API } from '../constants/apiRoutes'

const taskService = {

  getAll: async (params) => {
    const res = await axiosInstance.get(API.TASKS.LIST, { params })
    return res.data.data
  },

  getById: async (id) => {
    const res = await axiosInstance.get(API.TASKS.SHOW(id))
    return res.data.data
  },

  create: async (data) => {
    const res = await axiosInstance.post(API.TASKS.CREATE, data)
    return res.data.data
  },

  update: async (id, data) => {
    const res = await axiosInstance.put(API.TASKS.UPDATE(id), data)
    return res.data.data
  },

  delete: async (id) => {
    const res = await axiosInstance.delete(API.TASKS.DELETE(id))
    return res.data
  },

  getMyTasks: async () => {
    const res = await axiosInstance.get(API.TASKS.MY_LIST)
    return res.data.data
  },
}

export default taskService
