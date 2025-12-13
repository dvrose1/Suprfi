// ABOUTME: Role definitions and permission checking for SuprClient
// ABOUTME: Defines what each contractor role can do

export type ContractorRole = 'owner' | 'manager' | 'tech' | 'viewer';

// Role hierarchy - higher number = more permissions
export const ROLE_LEVELS: Record<ContractorRole, number> = {
  viewer: 1,
  tech: 2,
  manager: 3,
  owner: 4,
};

// Pages and their minimum required role
export const PAGE_PERMISSIONS: Record<string, ContractorRole> = {
  '/client': 'viewer',
  '/client/applications': 'viewer',
  '/client/applications/[id]': 'viewer',
  '/client/loans': 'viewer',
  '/client/loans/[id]': 'viewer',
  '/client/analytics': 'viewer',
  '/client/new': 'tech',
  '/client/team': 'manager',
  '/client/settings': 'viewer',
};

// Actions and their minimum required role
export const ACTION_PERMISSIONS: Record<string, ContractorRole> = {
  // Dashboard
  'dashboard:view': 'viewer',
  
  // Application actions
  'application:view_all': 'viewer',
  'application:view_own': 'tech',
  'application:send_link': 'tech',
  'application:generate_qr': 'tech',
  'application:resend': 'tech',
  'application:cancel': 'manager',
  'application:export': 'manager',
  
  // Loan actions
  'loan:view': 'viewer',
  
  // Analytics actions
  'analytics:view': 'viewer',
  
  // Team management
  'team:view': 'manager',
  'team:invite': 'manager',
  'team:update_role': 'manager',
  'team:deactivate': 'manager',
  
  // Settings
  'settings:view': 'viewer',
  'settings:update_profile': 'tech',
  'settings:update_notifications': 'tech',
  'settings:manage_api_key': 'owner',
  'settings:change_password': 'tech',
  'settings:view_sessions': 'tech',
  'settings:delete_account': 'owner',
};

export function hasRoleLevel(userRole: ContractorRole, requiredRole: ContractorRole): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole];
}

export function canAccessPage(userRole: ContractorRole, path: string): boolean {
  // Normalize path to match patterns
  const normalizedPath = path.replace(/\/[a-zA-Z0-9_-]+$/, '/[id]');
  const requiredRole = PAGE_PERMISSIONS[path] || PAGE_PERMISSIONS[normalizedPath];
  
  if (!requiredRole) {
    // Default to viewer access for unlisted pages
    return true;
  }
  
  return hasRoleLevel(userRole, requiredRole);
}

export function canPerformAction(userRole: ContractorRole, action: string): boolean {
  const requiredRole = ACTION_PERMISSIONS[action];
  
  if (!requiredRole) {
    // Default deny for unlisted actions
    return false;
  }
  
  return hasRoleLevel(userRole, requiredRole);
}

export function canManageRole(managerRole: ContractorRole, targetRole: ContractorRole): boolean {
  // Owner can manage everyone except other owners
  if (managerRole === 'owner') {
    return targetRole !== 'owner';
  }
  
  // Manager can manage tech and viewers
  if (managerRole === 'manager') {
    return targetRole === 'tech' || targetRole === 'viewer';
  }
  
  // Tech and viewers can't manage anyone
  return false;
}

export function getManageableRoles(userRole: ContractorRole): ContractorRole[] {
  switch (userRole) {
    case 'owner':
      return ['manager', 'tech', 'viewer'];
    case 'manager':
      return ['tech', 'viewer'];
    default:
      return [];
  }
}

export function getRoleDisplayName(role: ContractorRole): string {
  const names: Record<ContractorRole, string> = {
    owner: 'Owner',
    manager: 'Manager',
    tech: 'Technician',
    viewer: 'Viewer',
  };
  return names[role];
}

export function getRoleDescription(role: ContractorRole): string {
  const descriptions: Record<ContractorRole, string> = {
    owner: 'Full access including billing and API keys',
    manager: 'Manage team and view all applications',
    tech: 'Send financing links and view own submissions',
    viewer: 'View-only access to dashboard and analytics',
  };
  return descriptions[role];
}
