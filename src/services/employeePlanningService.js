import axiosInstance from './axiosInstance'
import { API } from '../constants/apiRoutes'

const employeePlanningService = {
  getMyPlanning(params) {
    return axiosInstance.get(API.ME.PLANNING, { params })
  },

  getMyDashboard() {
    return axiosInstance.get(API.ME.DASHBOARD)
  },
}

export default employeePlanningService
