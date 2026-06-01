/**
 * Role constants — match backend User::ROLE_ADMIN and ROLE_EMPLOYEE exactly.
 */
export const ROLES = {
  ADMIN:    'admin',
  EMPLOYEE: 'employee',
}

/**
 * Route prefixes per role.
 */
export const ROLE_HOME = {
  admin:    '/admin/dashboard',
  employee: '/employee/dashboard',
}