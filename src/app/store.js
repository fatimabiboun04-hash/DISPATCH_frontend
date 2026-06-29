import { combineReducers, configureStore } from '@reduxjs/toolkit'
import authReducer          from '../features/auth/authSlice'
import notificationReducer  from '../features/notifications/notificationSlice'
import dashboardReducer     from '../features/dashboard/dashboardSlice'
import employeeReducer      from '../features/employees/employeeSlice'
import ratingReducer        from '../features/ratings/ratingSlice'
import teamReducer          from '../features/teams/teamSlice'
import shiftReducer         from '../features/shifts/shiftSlice'
import planningReducer          from '../features/planning/planningSlice'
import planningTemplateReducer  from '../features/planning/planningTemplateSlice'
import planningSandboxReducer   from '../features/planning/planningSandboxSlice'
import planningStatsReducer     from '../features/planning/planningStatsSlice'
import planningAuditReducer     from '../features/planning/planningAuditSlice'
import pauseReducer             from '../features/pauses/pauseSlice'
import pointageReducer      from '../features/pointage/pointageSlice'
import leaveReducer         from '../features/leave/leaveSlice'
import reportReducer        from '../features/reports/reportSlice'
import historyReducer       from '../features/history/historySlice'
import settingsReducer      from '../features/settings/settingsSlice'
import deviceReducer        from '../features/devices/deviceSlice'
import taskReducer          from '../features/tasks/taskSlice'
import skillReducer         from '../features/skills/skillSlice'
import searchReducer        from '../features/search/searchSlice'

const appReducer = combineReducers({
  auth:          authReducer,
  notifications: notificationReducer,
  dashboard:     dashboardReducer,
  employees:     employeeReducer,
  ratings:       ratingReducer,
  teams:         teamReducer,
  shifts:        shiftReducer,
  planning:            planningReducer,
  planningTemplates:   planningTemplateReducer,
  planningSandbox:     planningSandboxReducer,
  planningStats:       planningStatsReducer,
  planningAudits:      planningAuditReducer,
  pauses:              pauseReducer,
  pointage:      pointageReducer,
  leave:         leaveReducer,
  reports:       reportReducer,
  history:       historyReducer,
  settings:      settingsReducer,
  devices:       deviceReducer,
  tasks:         taskReducer,
  skills:        skillReducer,
  search:        searchReducer,
})

const rootReducer = (state, action) => {
  if (action.type === 'app/resetAll') {
    return appReducer(undefined, action)
  }
  return appReducer(state, action)
}

const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.DEV,
})

export default store