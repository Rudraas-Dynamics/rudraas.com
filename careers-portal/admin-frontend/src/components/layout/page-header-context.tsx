import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

interface PageHeaderContextValue {
  title: string
  setTitle: (title: string) => void
}

const PageHeaderContext = createContext<PageHeaderContextValue | undefined>(undefined)

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('Dashboard')

  const value = useMemo<PageHeaderContextValue>(() => ({ title, setTitle }), [title])

  return <PageHeaderContext.Provider value={value}>{children}</PageHeaderContext.Provider>
}

export function usePageHeader(): PageHeaderContextValue {
  const context = useContext(PageHeaderContext)
  if (!context) {
    throw new Error('usePageHeader must be used within a PageHeaderProvider')
  }
  return context
}

export function usePageTitle(title: string): void {
  const { setTitle } = usePageHeader()

  useEffect(() => {
    setTitle(title)
  }, [title, setTitle])
}
