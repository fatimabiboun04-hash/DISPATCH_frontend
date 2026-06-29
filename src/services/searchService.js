import axiosInstance from './axiosInstance'
import { API } from '../constants/apiRoutes'

const searchService = {
  globalSearch: async (query, signal) => {
    const res = await axiosInstance.get(API.SEARCH, { params: { q: query }, signal })
    return res.data.data
  },
}

export default searchService
