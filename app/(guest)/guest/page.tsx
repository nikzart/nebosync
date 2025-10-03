import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ServiceCard } from '@/components/guest/service-card'
import { QuickActions } from '@/components/guest/quick-actions'
import { Bell } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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

  const services = await prisma.service.findMany({
    where: { isAvailable: true },
    take: 4
  })

  const foodItems = await prisma.foodMenu.findMany({
    where: { isAvailable: true },
    take: 3
  })

  // Calculate totals
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Header */}
      <header className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-8">
          <Avatar className="w-12 h-12">
            <AvatarImage src="" />
            <AvatarFallback className="bg-pastel-purple text-white">
              {guest?.name?.charAt(0) || 'G'}
            </AvatarFallback>
          </Avatar>
          <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div>
          <h1 className="text-4xl font-semibold text-gray-900 mb-2">
            Hello
          </h1>
          <h2 className="text-4xl font-semibold text-gray-900">
            {guest?.name?.split(' ')[0] || 'Guest'}!
          </h2>
        </div>
      </header>

      {/* Stats Card with Gradient */}
      <div className="px-6 mb-8">
        <div
          className="rounded-[2rem] p-8 shadow-lg relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #c4b5fd 0%, #e0d7ff 100%)',
          }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-5xl font-bold text-white mb-2">
                  ₹{totalSpent._sum.totalAmount?.toLocaleString('en-IN') || '0'}
                </p>
                <p className="text-sm text-white/80 font-medium">Total Spending</p>
              </div>
              <div className="text-right">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
                  <p className="text-3xl font-bold text-white">
                    {activeOrders}
                  </p>
                </div>
                <p className="text-xs text-white/80 font-medium">Active Orders</p>
              </div>
            </div>

            {/* Room Info */}
            <div className="bg-white/25 backdrop-blur-md rounded-2xl p-5 border border-white/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-white">Room {guest?.room?.roomNumber}</p>
                  <p className="text-sm text-white/80 mt-0.5">{guest?.room?.roomType}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Featured Services */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-2xl font-bold text-gray-900">Popular Services</h3>
          <a href="/guest/services" className="text-sm text-pastel-purple font-semibold hover:text-pastel-purple/80 transition-colors">
            View All →
          </a>
        </div>
        <div className="space-y-4">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              name={service.name}
              description={service.description || ''}
              price={service.price}
              imageUrl={service.imageUrl || ''}
              category={service.category}
            />
          ))}
        </div>
      </div>

      {/* Today's Specials */}
      <div className="px-6 mb-6 pb-24">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-2xl font-bold text-gray-900">Today's Specials</h3>
          <a href="/guest/food" className="text-sm text-pastel-purple font-semibold hover:text-pastel-purple/80 transition-colors">
            View Menu →
          </a>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {foodItems.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-[1.5rem] p-3 shadow-md hover:shadow-lg transition-all duration-200 aspect-square flex flex-col justify-between"
            >
              <div
                className="w-full h-20 rounded-xl mb-2 bg-gradient-to-br from-pastel-purple/30 to-pastel-lavender/50"
                style={{
                  backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div>
                <p className="text-xs font-bold text-gray-900 truncate mb-1">{item.name}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-pastel-purple font-bold">₹{item.price}</p>
                  {item.isVeg && (
                    <div className="w-4 h-4 border-2 border-green-600 rounded flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
