import axiosInstance from './axiosInstance'
import { API } from '../constants/apiRoutes'

const notificationService = {
  getAll: async () => {
    const res = await axiosInstance.get(API.ME.NOTIFICATIONS)
    return res.data
  },
  getUnreadCount: async () => {
    const res = await axiosInstance.get(API.ME.UNREAD_COUNT)
    return res.data.data?.count ?? 0
  },
  markRead: async (id) => {
    const res = await axiosInstance.post(API.ME.MARK_READ(id))
    return res.data
  },
  markAllRead: async () => {
    const res = await axiosInstance.post(API.ME.MARK_ALL_READ)
    return res.data
  },
}

export default notificationService