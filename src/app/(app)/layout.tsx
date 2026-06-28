import { Sidebar } from '@/components/layout/sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1 ml-56 flex flex-col min-h-screen overflow-hidden">
        {children}
      </div>
    </div>
  )
}
