import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { GuestBottomNav } from '@/components/guest/bottom-nav'

export default async function GuestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || session.user.role !== 'GUEST') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-soft-gray pb-20">
      <main className="max-w-md mx-auto">
        {children}
      </main>
      <GuestBottomNav />
    </div>
  )
}
