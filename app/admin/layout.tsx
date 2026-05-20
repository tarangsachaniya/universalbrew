import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  return (
    <SidebarProvider>
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="flex h-14 items-center gap-4 border-b px-4 sm:px-6 bg-background sticky top-0 z-40">
          <SidebarTrigger />
          <span className="text-sm text-muted-foreground">Admin Panel</span>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
