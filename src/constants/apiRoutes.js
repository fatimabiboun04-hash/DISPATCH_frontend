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
    GENERATE_NEXT:     `${BASE}/planning/generate-next-week`,
    LOCK_CURRENT:      `${BASE}/planning/lock-current-week`,
  },

  // ── Pauses ────────────────────────────────────────────────
  PAUSES: {
    CREATE:       `${BASE}/pauses`,
    UPDATE:       (id) => `${BASE}/pauses/${id}`,
    DELETE:       (id) => `${BASE}/pauses/${id}`,
    BY_PLANNING:  (planningId) => `${BASE}/pauses/planning/${planningId}`,
    ACTIVE_TODAY: `${BASE}/pauses/active-today`,
  },

  // ── Pointage ──────────────────────────────────────────────
  POINTAGE: {
    CHECK_IN:       `${BASE}/pointages/check-in`,
    CHECK_OUT:      `${BASE}/pointages/check-out`,
    FLAGGED:        `${BASE}/pointages/flagged`,
    VERIFY:         (id) => `${BASE}/pointages/${id}/verify`,
    ABSENT_TODAY:   `${BASE}/pointage/absent-today`,
    REPLACEMENT:    (planningId) => `${BASE}/pointage/replacement-suggestion/${planningId}`,
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
  },

  // ── Reports ───────────────────────────────────────────────
  REPORTS: {
    LIST:     `${BASE}/reports`,
    CREATE:   `${BASE}/reports`,
    DOWNLOAD: (id) => `${BASE}/reports/${id}/download`,
  },

  // ── Ratings ───────────────────────────────────────────────
  RATINGS: {
    TOGGLE:  (employeeId) => `${BASE}/ratings/toggle/${employeeId}`,
    CURRENT: (employeeId) => `${BASE}/ratings/current/${employeeId}`,
    HISTORY: (employeeId) => `${BASE}/ratings/history/${employeeId}`,
  },

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