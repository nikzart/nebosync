import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { GuestBottomNav } from '@/components/guest/bottom-nav'
import { CartProviderWrapper } from '@/components/guest/cart-provider-wrapper'

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
    <CartProviderWrapper>
      <div className="min-h-screen bg-[#FAF9F6] pb-[88px]">
        <main className="max-w-md mx-auto">
          {children}
        </main>
        <GuestBottomNav />
      </div>
    </CartProviderWrapper>
  )
}
