import { configureStore }  from '@reduxjs/toolkit'
import authReducer          from '../features/auth/authSlice'
import notificationReducer  from '../features/notifications/notificationSlice'
import dashboardReducer     from '../features/dashboard/dashboardSlice'
import employeeReducer      from '../features/employees/employeeSlice'
import ratingReducer        from '../features/ratings/ratingSlice'
import teamReducer          from '../features/teams/teamSlice'
import shiftReducer         from '../features/shifts/shiftSlice'
import planningReducer      from '../features/planning/planningSlice'
import pauseReducer         from '../features/pauses/pauseSlice'
import pointageReducer      from '../features/pointage/pointageSlice'
import leaveReducer         from '../features/leave/leaveSlice'
import reportReducer        from '../features/reports/reportSlice'
import historyReducer       from '../features/history/historySlice'
import settingsReducer      from '../features/settings/settingsSlice'
import deviceReducer        from '../features/devices/deviceSlice'

const store = configureStore({
  reducer: {
    auth:          authReducer,
    notifications: notificationReducer,
    dashboard:     dashboardReducer,
    employees:     employeeReducer,
    ratings:       ratingReducer,
    teams:         teamReducer,
    shifts:        shiftReducer,
    planning:      planningReducer,
    pauses:        pauseReducer,
    pointage:      pointageReducer,
    leave:         leaveReducer,
    reports:       reportReducer,
    history:       historyReducer,
    settings:      settingsReducer,
    devices:       deviceReducer,
  },
  devTools: import.meta.env.DEV,
})

export default store