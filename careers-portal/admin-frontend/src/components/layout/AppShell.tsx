import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { PageHeaderProvider } from '@/components/layout/page-header-context'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

export function AppShell() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <PageHeaderProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <aside className="hidden w-64 shrink-0 border-r border-border md:block">
          <Sidebar />
        </aside>

        {isDrawerOpen ? (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setIsDrawerOpen(false)}
              aria-hidden="true"
            />
            <div
              className={cn(
                'absolute inset-y-0 left-0 w-64 border-r border-border bg-card transition-transform duration-200',
              )}
            >
              <Sidebar onNavigate={() => setIsDrawerOpen(false)} />
            </div>
          </div>
        ) : null}

        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar onOpenSidebar={() => setIsDrawerOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </PageHeaderProvider>
  )
}
