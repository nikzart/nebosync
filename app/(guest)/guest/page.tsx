import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { QuickActions } from '@/components/guest/quick-actions'
import { Key } from 'lucide-react'
import Link from 'next/link'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function GuestHome() {
  const session = await auth()

  const guest = await prisma.guest.findUnique({
    where: { id: session?.user.id },
    include: {
      room: true,
      orders: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  const foodItems = await prisma.foodMenu.findMany({
    where: { isAvailable: true },
    take: 6
  })

  const totalSpent = await prisma.order.aggregate({
    where: { guestId: guest?.id },
    _sum: { totalAmount: true }
  })

  const activeOrders = await prisma.order.count({
    where: {
      guestId: guest?.id,
      status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] }
    }
  })

  const checkInDate = guest?.checkInDate
  const daysStayed = checkInDate
    ? Math.max(1, Math.ceil((Date.now() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="min-h-screen">
      {/* Greeting */}
      <header className="px-5 pt-12 pb-2">
        <p className="text-[11px] font-semibold text-[#A1A1A1] uppercase tracking-[0.08em] mb-1">
          {getGreeting()}
        </p>
        <h1 className="text-[24px] font-semibold text-[#1C1C1C] tracking-tight">
          {guest?.name?.split(' ')[0] || 'Guest'}
        </h1>
      </header>

      {/* Room Card */}
      <div className="px-5 mt-4 mb-6">
        <div className="bg-[#2D5A3D] rounded-[12px] p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#C9A96E]" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-white/50 uppercase tracking-[0.08em] mb-1">
                Your Room
              </p>
              <p className="text-[28px] font-bold text-white tracking-tight">
                {guest?.room?.roomNumber || '—'}
              </p>
              <p className="text-[13px] text-white/60 mt-0.5">
                {guest?.room?.roomType}{guest?.room?.floor ? ` · Floor ${guest.room.floor}` : ''}
              </p>
            </div>
            <div className="w-12 h-12 rounded-[10px] bg-white/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-[#C9A96E]" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex gap-3 px-5 overflow-x-auto scrollbar-hide py-1 mb-6">
        {activeOrders > 0 && (
          <Link href="/guest/orders"
            className="flex items-center gap-2 bg-white rounded-[8px] px-3 py-2 shrink-0"
            style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="w-2 h-2 rounded-full bg-[#C9A96E]" />
            <span className="text-[13px] font-medium text-[#1C1C1C]">
              {activeOrders} active
            </span>
          </Link>
        )}
        <div className="flex items-center gap-2 bg-white rounded-[8px] px-3 py-2 shrink-0"
             style={{ boxShadow: 'var(--shadow-card)' }}>
          <span className="text-[13px] text-[#6B6B6B]">Spent</span>
          <span className="text-[13px] font-semibold text-[#1C1C1C]">
            ₹{totalSpent._sum.totalAmount?.toLocaleString('en-IN') || '0'}
          </span>
        </div>
        {daysStayed > 0 && (
          <div className="flex items-center gap-2 bg-white rounded-[8px] px-3 py-2 shrink-0"
               style={{ boxShadow: 'var(--shadow-card)' }}>
            <span className="text-[13px] text-[#6B6B6B]">Day {daysStayed}</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Popular Items — Horizontal Scroll */}
      {foodItems.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between px-5 mb-3">
            <h3 className="text-[18px] font-semibold text-[#1C1C1C] tracking-tight">
              Popular Items
            </h3>
            <Link href="/guest/food" className="text-[13px] font-medium text-[#2D5A3D]">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 px-5">
              {foodItems.map((item) => (
                <Link key={item.id} href="/guest/food" className="w-[160px] shrink-0 bg-white rounded-[12px] overflow-hidden"
                      style={{ boxShadow: 'var(--shadow-card)' }}>
                  <div
                    className="h-[120px] bg-[#F2F0EC]"
                    style={{
                      backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {item.isVeg !== null && (
                        <div className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center ${
                          item.isVeg ? 'border-[#2D5A3D]' : 'border-[#B5403A]'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            item.isVeg ? 'bg-[#2D5A3D]' : 'bg-[#B5403A]'
                          }`} />
                        </div>
                      )}
                      <p className="text-[14px] font-semibold text-[#1C1C1C] truncate">{item.name}</p>
                    </div>
                    <p className="text-[14px] font-semibold text-[#2D5A3D] mt-1">
                      ₹{item.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
