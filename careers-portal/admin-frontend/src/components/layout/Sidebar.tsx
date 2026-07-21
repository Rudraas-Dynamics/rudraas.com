import { NavLink } from 'react-router-dom'
import { Briefcase, LayoutDashboard, LogOut, Users as UsersIcon, UsersRound } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/auth-context'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
}

const baseNavItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/applications', label: 'Applications', icon: UsersRound },
]

const adminNavItems: NavItem[] = [{ to: '/users', label: 'Users', icon: UsersIcon }]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { user, logout } = useAuth()
  const navItems = user?.role === 'ADMIN' ? [...baseNavItems, ...adminNavItems] : baseNavItems

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex h-14 items-center border-b border-border px-4">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Rudraas
        </span>
        <span className="ml-1.5 font-heading text-sm font-semibold">Careers</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <Separator />

      <div className="p-3">
        <div className="flex items-center gap-3 rounded-md px-1 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{user ? getInitials(user.name) : '?'}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-none">{user?.name}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">{user?.role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void logout()}
          className="mt-1 w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  )
}
