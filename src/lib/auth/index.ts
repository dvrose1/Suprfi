// ABOUTME: Auth module exports
// ABOUTME: Central export point for authentication utilities

export { hashPassword, verifyPassword, validatePassword, generateSecureToken } from './password';
export { 
  createSession, 
  validateSession, 
  destroySession, 
  destroyAllUserSessions,
  getSessionFromCookies,
  SESSION_COOKIE_CONFIG,
  type SessionUser,
} from './session';
export {
  hasRoleLevel,
  canAccessPage,
  canPerformAction,
  canManageRole,
  getManageableRoles,
  isViewerOnly,
  getRoleDisplayName,
  ROLE_LEVELS,
  type AdminRole,
} from './roles';
export {
  logAuditEvent,
  getAuditLogs,
  getActionDisplayName,
  type AuditAction,
} from './audit';
