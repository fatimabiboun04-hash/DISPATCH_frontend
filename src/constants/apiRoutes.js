/**
 * Centralized API route constants.
 * Match the Laravel backend routes exactly — do not modify.
 */

const BASE = '/v1'

export const API = {
  // ── Auth ────────────────────────────────────────────────
  AUTH: {
    LOGIN:  `${BASE}/login`,
    LOGOUT: `${BASE}/logout`,
  },

  // ── Profile (self) ───────────────────────────────────────
  ME: {
    PROFILE:          `${BASE}/me`,
    PLANNING:         `${BASE}/me/planning`,
    POINTAGES:        `${BASE}/me/pointages`,
    LEAVE_REQUESTS:   `${BASE}/me/leave-requests`,
    HISTORY:          `${BASE}/me/history`,
    NOTIFICATIONS:    `${BASE}/me/notifications`,
    UNREAD_COUNT:     `${BASE}/me/notifications/unread-count`,
    MARK_READ:        (id) => `${BASE}/me/notifications/${id}/read`,
    MARK_ALL_READ:    `${BASE}/me/notifications/read-all`,
  },

  // ── Employees ────────────────────────────────────────────
  EMPLOYEES: {
    LIST:     `${BASE}/employees`,
    CREATE:   `${BASE}/employees`,
    SHOW:     (id) => `${BASE}/employees/${id}`,
    UPDATE:   (id) => `${BASE}/employees/${id}`,
    DELETE:   (id) => `${BASE}/employees/${id}`,
    HISTORY:  (id) => `${BASE}/employees/${id}/history`,
    PLANNING: (id) => `${BASE}/employees/${id}/planning`,
    POINTAGES:(id) => `${BASE}/employees/${id}/pointages`,
  },

  // ── Teams ─────────────────────────────────────────────────
  TEAMS: {
    LIST:   `${BASE}/teams`,
    CREATE: `${BASE}/teams`,
    SHOW:   (id) => `${BASE}/teams/${id}`,
    UPDATE: (id) => `${BASE}/teams/${id}`,
    DELETE: (id) => `${BASE}/teams/${id}`,
    ASSIGN: (id) => `${BASE}/teams/${id}/assign`,
    REMOVE: (teamId, userId) => `${BASE}/teams/${teamId}/remove/${userId}`,
  },

  SKILLS: {
    LIST:   `${BASE}/skills`,
    CREATE: `${BASE}/skills`,
    UPDATE: (id) => `${BASE}/skills/${id}`,
    DELETE: (id) => `${BASE}/skills/${id}`,
  },

  // ── Tasks ─────────────────────────────────────────────────
  TASKS: {
    LIST:    `${BASE}/tasks`,
    CREATE:  `${BASE}/tasks`,
    SHOW:    (id) => `${BASE}/tasks/${id}`,
    UPDATE:  (id) => `${BASE}/tasks/${id}`,
    DELETE:  (id) => `${BASE}/tasks/${id}`,
    MY_LIST: `${BASE}/me/tasks`,
  },

  // ── Shifts ────────────────────────────────────────────────
  SHIFTS: {
    LIST:   `${BASE}/shifts`,
    CREATE: `${BASE}/shifts`,
    UPDATE: (id) => `${BASE}/shifts/${id}`,
    DELETE: (id) => `${BASE}/shifts/${id}`,
  },

  // ── Planning ──────────────────────────────────────────────
  PLANNING: {
    LIST:              `${BASE}/planning`,
    CREATE:            `${BASE}/planning`,
    SHOW:              (id) => `${BASE}/planning/${id}`,
    UPDATE:            (id) => `${BASE}/planning/${id}`,
    DELETE:            (id) => `${BASE}/planning/${id}`,
    SUGGEST:           `${BASE}/planning/suggest`,
    OVERRIDE_LOCK:     `${BASE}/planning/override-lock`,
    LOCK:              (id) => `${BASE}/planning/${id}/lock`,
    GENERATE_NEXT:     `${BASE}/planning/generate-next-week`,
    LOCK_CURRENT:      `${BASE}/planning/lock-current-week`,
    // Templates
    TEMPLATES:         `${BASE}/planning-templates`,
    TEMPLATE_SHOW:     (id) => `${BASE}/planning-templates/${id}`,
    TEMPLATE_UPDATE:   (id) => `${BASE}/planning-templates/${id}`,
    TEMPLATE_DELETE:   (id) => `${BASE}/planning-templates/${id}`,
    TEMPLATE_DUPLICATE:(id) => `${BASE}/planning-templates/${id}/duplicate`,
    TEMPLATE_LOAD:     (id) => `${BASE}/planning-templates/${id}/load`,
    // Sandbox
    SANDBOX_GENERATE:  `${BASE}/planning/sandbox/generate`,
    SANDBOX_PREVIEW:   `${BASE}/planning/sandbox/preview`,
    SANDBOX_ACCEPT:    `${BASE}/planning/sandbox/accept`,
    SANDBOX_CANCEL:    `${BASE}/planning/sandbox/cancel`,
    // Stats
    STATS:             `${BASE}/planning/stats`,
    // Coverage & quality
    COVERAGE:          `${BASE}/planning/coverage`,
    QUALITY:           `${BASE}/planning/quality`,
    // Audit
    AUDITS:            `${BASE}/planning/audits`,
    // Batch operations
    BATCH_DELETE:      `${BASE}/planning/batch/delete`,
    BATCH_UPDATE_SHIFT: `${BASE}/planning/batch/update-shift`,
    BATCH_ASSIGN_EMPLOYEE: `${BASE}/planning/batch/assign-employee`,
    BATCH_DUPLICATE_DAY: `${BASE}/planning/batch/duplicate-day`,
    BATCH_VALIDATE:    `${BASE}/planning/batch/validate`,
    EMPLOYEE_INFO:     (id) => `${BASE}/planning/employee-info/${id}`,
  },

  // ── Pauses ────────────────────────────────────────────────
  PAUSES: {
    LIST:         `${BASE}/pauses`,
    STATS:        `${BASE}/pauses/stats`,
    CREATE:       `${BASE}/pauses`,
    SHOW:         (id) => `${BASE}/pauses/${id}`,
    UPDATE:       (id) => `${BASE}/pauses/${id}`,
    CANCEL:       (id) => `${BASE}/pauses/${id}/cancel`,
    COMPLETE:     (id) => `${BASE}/pauses/${id}/complete`,
    DELETE:       (id) => `${BASE}/pauses/${id}`,
    BY_PLANNING:  (planningId) => `${BASE}/pauses/planning/${planningId}`,
    BATCH:        `${BASE}/pauses/batch`,
    ACTIVE_TODAY: `${BASE}/pauses/active-today`,
    START_MY:     `${BASE}/me/pauses/start`,
    STOP_MY:      `${BASE}/me/pauses/stop`,
  },

  // ── Pointage ──────────────────────────────────────────────
  POINTAGE: {
    CHECK_IN:       `${BASE}/pointages/check-in`,
    CHECK_OUT:      `${BASE}/pointages/check-out`,
    FLAGGED:        `${BASE}/pointages/flagged`,
    VERIFY:         (id) => `${BASE}/pointages/${id}/verify`,
    ABSENT_TODAY:   `${BASE}/pointage/absent-today`,
    REPLACEMENT:         (planningId) => `${BASE}/pointage/replacement-suggestion/${planningId}`,
    ASSIGN_REPLACEMENT:  (planningId) => `${BASE}/pointage/assign-replacement/${planningId}`,
  },

  // ── Leave Requests ────────────────────────────────────────
  LEAVE: {
    LIST:    `${BASE}/leave-requests`,
    CREATE:  `${BASE}/leave-requests`,
    APPROVE: (id) => `${BASE}/leave-requests/${id}/approve`,
    REJECT:  (id) => `${BASE}/leave-requests/${id}/reject`,
  },

  // ── Dashboard ─────────────────────────────────────────────
  DASHBOARD: {
    STATS:         `${BASE}/dashboard/stats`,
    LIVE_FEED:     `${BASE}/dashboard/live-feed`,
    COVERAGE:      `${BASE}/dashboard/coverage`,
    ACTIVE_PAUSES: `${BASE}/dashboard/active-pauses`,
    WEEKLY_HISTORY:`${BASE}/dashboard/weekly-history`,
  },

  // ── Reports ───────────────────────────────────────────────
  REPORTS: {
    LIST:     `${BASE}/reports`,
    CREATE:   `${BASE}/reports`,
    SHOW:     (id) => `${BASE}/reports/${id}`,
    DOWNLOAD: (id) => `${BASE}/reports/${id}/download`,
  },

  // ── Ratings ───────────────────────────────────────────────
  RATINGS: {
    RATE:    (employeeId) => `${BASE}/ratings/rate/${employeeId}`,
    CURRENT: (employeeId) => `${BASE}/ratings/current/${employeeId}`,
    HISTORY: (employeeId) => `${BASE}/ratings/history/${employeeId}`,
    STATS:   `${BASE}/ratings/stats`,
  },

  // ── Global Search ─────────────────────────────────────────
  SEARCH: `${BASE}/search`,

  // ── Audit Logs ────────────────────────────────────────────
  AUDIT: {
    LIST: `${BASE}/audit-logs`,
  },

  // ── Settings ──────────────────────────────────────────────
  SETTINGS: {
    GET:    `${BASE}/settings`,
    UPDATE: `${BASE}/settings`,
  },

  // ── Devices ───────────────────────────────────────────────
  DEVICES: {
    LIST:    `${BASE}/devices`,
    TRUST:   (id) => `${BASE}/devices/${id}/trust`,
    UNTRUST: (id) => `${BASE}/devices/${id}/untrust`,
  },
}
