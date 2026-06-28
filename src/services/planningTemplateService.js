import axiosInstance from './axiosInstance'
import { API } from '../constants/apiRoutes'

const planningTemplateService = {
  getAll: async (params = {}) => {
    const res = await axiosInstance.get(API.PLANNING.TEMPLATES, { params })
    return { data: res.data.data, meta: res.data.meta }
  },

  getOne: async (id) => {
    const res = await axiosInstance.get(API.PLANNING.TEMPLATE_SHOW(id))
    return res.data.data
  },

  create: async (data) => {
    const res = await axiosInstance.post(API.PLANNING.TEMPLATES, data)
    return res.data.data
  },

  update: async (id, data) => {
    const res = await axiosInstance.put(API.PLANNING.TEMPLATE_UPDATE(id), data)
    return res.data.data
  },

  delete: async (id) => {
    await axiosInstance.delete(API.PLANNING.TEMPLATE_DELETE(id))
  },

  duplicate: async (id, name) => {
    const res = await axiosInstance.post(API.PLANNING.TEMPLATE_DUPLICATE(id), { name })
    return res.data.data
  },

  load: async (id, { week_number, year }) => {
    const res = await axiosInstance.post(API.PLANNING.TEMPLATE_LOAD(id), { week_number, year })
    return res.data.data
  },
}

export default planningTemplateService
