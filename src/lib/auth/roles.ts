// ABOUTME: Role definitions and permission checking
// ABOUTME: Defines what each role can do in the admin system

export type AdminRole = 'god' | 'admin' | 'ops' | 'viewer';

// Role hierarchy - higher number = more permissions
export const ROLE_LEVELS: Record<AdminRole, number> = {
  viewer: 1,
  ops: 2,
  admin: 3,
  god: 4,
};

// Pages and their minimum required role
export const PAGE_PERMISSIONS: Record<string, AdminRole> = {
  '/admin': 'viewer',
  '/admin/applications': 'viewer',
  '/admin/applications/[id]': 'viewer',
  '/admin/manual-review': 'viewer',
  '/admin/waitlist': 'viewer',
  '/admin/contractors': 'viewer',
  '/admin/contractors/[id]': 'viewer',
  '/admin/users': 'admin',
  '/admin/users/invite': 'admin',
  '/admin/audit': 'god',
};

// Actions and their minimum required role
export const ACTION_PERMISSIONS: Record<string, AdminRole> = {
  // Application actions
  'application:view': 'viewer',
  'application:approve': 'ops',
  'application:decline': 'ops',
  
  // Waitlist actions
  'waitlist:view': 'viewer',
  'waitlist:update': 'ops',
  'waitlist:delete': 'admin',
  
  // Contractor actions
  'contractor:view': 'viewer',
  'contractor:update': 'ops',
  'contractor:suspend': 'admin',
  
  // User management actions
  'user:view': 'admin',
  'user:create': 'admin',
  'user:update': 'admin',
  'user:deactivate': 'admin',
  'user:force_logout': 'god',
  
  // Audit actions
  'audit:view': 'god',
};

export function hasRoleLevel(userRole: AdminRole, requiredRole: AdminRole): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole];
}

export function canAccessPage(userRole: AdminRole, path: string): boolean {
  // Normalize path to match patterns
  const normalizedPath = path.replace(/\/[a-zA-Z0-9_-]+$/, '/[id]');
  const requiredRole = PAGE_PERMISSIONS[path] || PAGE_PERMISSIONS[normalizedPath];
  
  if (!requiredRole) {
    // Default to viewer access for unlisted pages
    return true;
  }
  
  return hasRoleLevel(userRole, requiredRole);
}

export function canPerformAction(userRole: AdminRole, action: string): boolean {
  const requiredRole = ACTION_PERMISSIONS[action];
  
  if (!requiredRole) {
    // Default deny for unlisted actions
    return false;
  }
  
  return hasRoleLevel(userRole, requiredRole);
}

export function canManageRole(managerRole: AdminRole, targetRole: AdminRole): boolean {
  // God can manage everyone
  if (managerRole === 'god') return true;
  
  // Admin can manage ops and viewers
  if (managerRole === 'admin') {
    return targetRole === 'ops' || targetRole === 'viewer';
  }
  
  // Ops and viewers can't manage anyone
  return false;
}

export function getManageableRoles(userRole: AdminRole): AdminRole[] {
  switch (userRole) {
    case 'god':
      return ['admin', 'ops', 'viewer'];
    case 'admin':
      return ['ops', 'viewer'];
    default:
      return [];
  }
}

export function isViewerOnly(role: AdminRole): boolean {
  return role === 'viewer';
}

export function getRoleDisplayName(role: AdminRole): string {
  const names: Record<AdminRole, string> = {
    god: 'God',
    admin: 'Admin',
    ops: 'Ops',
    viewer: 'Viewer',
  };
  return names[role];
}
