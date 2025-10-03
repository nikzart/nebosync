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

      {/* Stats */}
      <div className="px-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-4xl font-bold text-gray-900">
                ₹{totalSpent._sum.totalAmount?.toLocaleString('en-IN') || '0'}
              </p>
              <p className="text-sm text-gray-500 mt-1">Total Spending</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-pastel-purple">
                {activeOrders}
              </p>
              <p className="text-sm text-gray-500 mt-1">Active Orders</p>
            </div>
          </div>

          {/* Room Info */}
          <div className="bg-pastel-lavender rounded-2xl p-4">
            <p className="text-sm text-gray-600">Room {guest?.room?.roomNumber}</p>
            <p className="text-xs text-gray-500 mt-1">{guest?.room?.roomType}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Featured Services */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Popular Services</h3>
          <a href="/guest/services" className="text-sm text-pastel-purple font-medium">
            View All
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
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Today's Specials</h3>
          <a href="/guest/food" className="text-sm text-pastel-purple font-medium">
            Menu
          </a>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {foodItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-3 shadow-sm aspect-square flex flex-col justify-between"
            >
              <div className="w-full h-16 bg-pastel-lavender rounded-xl mb-2" />
              <div>
                <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-pastel-purple font-semibold">₹{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
