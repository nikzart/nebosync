import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { StaffSidebar } from '@/components/staff/sidebar'
import { StaffHeader } from '@/components/staff/header'

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || session.user.role === 'GUEST') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]" data-theme="dark">
      <StaffSidebar />
      <div className="ml-20">
        <StaffHeader user={session.user} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
