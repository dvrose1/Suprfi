---
name: suprfi-admin-dashboard
description: Build or modify admin dashboard (SuprOps) features including tables, RBAC, audit logging, and internal tools. Use when working on any /admin/* routes or admin-facing functionality.
---

# Skill: SuprFi Admin Dashboard (SuprOps)

## Purpose

Implement admin-facing features following established patterns for internal tools, with proper authentication, authorization, and audit logging.

## When to use this skill

- Building new admin pages
- Adding data tables or lists
- Implementing RBAC checks
- Creating audit log entries
- Any `/admin/*` routes

## Directory Structure
```
src/app/admin/
  layout.tsx              # Auth wrapper, sidebar navigation
  page.tsx                # Dashboard home with stats
  login/page.tsx          # Admin login
  applications/
    page.tsx              # Applications list
    [id]/page.tsx         # Application detail
  contractors/
    page.tsx              # Contractor management
    [id]/page.tsx         # Contractor detail
  users/page.tsx          # Admin user management
  waitlist/page.tsx       # Waitlist entries
  audit/page.tsx          # Audit log viewer
  manual-review/page.tsx  # Pending reviews queue

src/lib/auth/
  index.ts                # Auth exports
  session.ts              # Session management
  roles.ts                # RBAC utilities
  audit.ts                # Audit logging
  password.ts             # Password hashing
```

## Admin Layout Pattern
```tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AdminUser {
  id: string
  email: string
  name: string
  role: 'viewer' | 'operator' | 'admin' | 'super_admin'
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/v1/admin/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/admin/login')
        } else {
          setUser(data.user)
        }
      })
      .catch(() => router.push('/admin/login'))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={user} currentPath={pathname} />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
```

## Sidebar Navigation Pattern
```tsx
const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: HomeIcon },
  { href: '/admin/applications', label: 'Applications', icon: FileTextIcon },
  { href: '/admin/contractors', label: 'Contractors', icon: UsersIcon },
  { href: '/admin/manual-review', label: 'Manual Review', icon: AlertCircleIcon, badge: true },
  { href: '/admin/waitlist', label: 'Waitlist', icon: ListIcon },
  { href: '/admin/users', label: 'Users', icon: ShieldIcon, roles: ['admin', 'super_admin'] },
  { href: '/admin/audit', label: 'Audit Log', icon: ClipboardIcon, roles: ['admin', 'super_admin'] },
]

function Sidebar({ user, currentPath }: { user: AdminUser; currentPath: string }) {
  return (
    <aside className="w-64 bg-navy text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <span className="text-xl font-bold font-display">
          <span className="text-white">Supr</span>
          <span className="text-teal">Ops</span>
        </span>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS
          .filter(item => !item.roles || item.roles.includes(user.role))
          .map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                currentPath === item.href
                  ? 'bg-teal text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
      </nav>
      
      {/* User info */}
      <div className="p-4 border-t border-white/10">
        <p className="text-sm text-white/70">{user.email}</p>
        <p className="text-xs text-white/50 capitalize">{user.role.replace('_', ' ')}</p>
      </div>
    </aside>
  )
}
```

## Data Table Pattern
```tsx
interface Column<T> {
  key: keyof T | string
  label: string
  render?: (item: T) => React.ReactNode
}

function DataTable<T extends { id: string }>({ 
  data, 
  columns, 
  onRowClick 
}: { 
  data: T[]
  columns: Column<T>[]
  onRowClick?: (item: T) => void 
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
              <th 
                key={String(col.key)} 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map(item => (
            <tr 
              key={item.id} 
              onClick={() => onRowClick?.(item)}
              className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
            >
              {columns.map(col => (
                <td key={String(col.key)} className="px-6 py-4 whitespace-nowrap text-sm">
                  {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

## Status Badge Pattern
```tsx
type ApplicationStatus = 'initiated' | 'submitted' | 'approved' | 'declined' | 'funded'

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  initiated: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  funded: 'bg-purple-100 text-purple-800',
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
```

## RBAC Check Pattern
```tsx
// In API routes
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Check role level
  if (!hasRoleLevel(user.role, 'operator')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // ... proceed with operation
}

// Role hierarchy: viewer < operator < admin < super_admin
const ROLE_LEVELS = {
  viewer: 1,
  operator: 2,
  admin: 3,
  super_admin: 4,
}

function hasRoleLevel(userRole: string, requiredRole: string): boolean {
  return (ROLE_LEVELS[userRole] || 0) >= (ROLE_LEVELS[requiredRole] || 0)
}
```

## Audit Logging Pattern
```tsx
// Always create audit logs for mutations
await prisma.$transaction([
  prisma.application.update({
    where: { id },
    data: { status: 'approved' },
  }),
  prisma.auditLog.create({
    data: {
      entityType: 'application',
      entityId: id,
      actor: user.id,
      action: 'approved',
      payload: {
        previousStatus: application.status,
        reason: approvalReason,
        approvedAmount: amount,
      },
    },
  }),
])
```

## Page Header Pattern
```tsx
function PageHeader({ 
  title, 
  description, 
  action 
}: { 
  title: string
  description?: string
  action?: React.ReactNode 
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold font-display text-navy">{title}</h1>
        {description && (
          <p className="mt-1 text-gray-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
```

## Verification

```bash
npm run lint
npx tsc --noEmit
```

## Checklist

- [ ] Auth check in layout or page
- [ ] Loading states while fetching data
- [ ] Tables have hover states on clickable rows
- [ ] Status badges use semantic colors
- [ ] RBAC checks for sensitive operations
- [ ] Audit logs created for all mutations
- [ ] Sidebar shows correct items based on role
- [ ] Error states handled gracefully
