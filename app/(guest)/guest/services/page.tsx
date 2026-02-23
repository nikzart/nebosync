'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, ShoppingCart, ConciergeBell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import { ServiceCard } from '@/components/guest/service-card'
import { staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface Service {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  category: string
  isAvailable: boolean
}

export default function ServicesPage() {
  const router = useRouter()
  const { addItem, totalItems } = useCart()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ['services', categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('available', 'true')
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter)
      }
      const res = await fetch(`/api/services?${params}`)
      if (!res.ok) throw new Error('Failed to fetch services')
      return res.json()
    },
  })

  const filteredServices = services?.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categories = [
    'all',
    ...Array.from(new Set(services?.map((s) => s.category) || [])),
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-[#FAF9F6]/90 backdrop-blur-lg z-10 px-5 pt-3 pb-3 border-b border-[#EDECEA]">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-[8px] bg-white flex items-center justify-center"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <ArrowLeft className="w-4 h-4 text-[#1C1C1C]" />
          </button>
          <h1 className="text-[18px] font-semibold text-[#1C1C1C] flex-1">Services</h1>
          <button
            onClick={() => router.push('/guest/cart')}
            data-cart-icon
            className="relative w-9 h-9 rounded-[8px] bg-[#2D5A3D] flex items-center justify-center"
          >
            <ShoppingCart className="w-4 h-4 text-white" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-[#C9A96E] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1A1]" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-[8px] bg-white border border-[#EDECEA] text-[14px] placeholder:text-[#A1A1A1] focus:outline-none focus:border-[#2D5A3D] focus:ring-1 focus:ring-[#2D5A3D]/20 transition-colors"
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all',
                categoryFilter === category
                  ? 'bg-[#2D5A3D] text-white'
                  : 'bg-white text-[#6B6B6B] border border-[#EDECEA]'
              )}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {/* Service List */}
      <div className="px-5 py-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-[12px] overflow-hidden"
                   style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="h-[120px] skeleton-shimmer" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 rounded skeleton-shimmer" />
                  <div className="h-3 w-full rounded skeleton-shimmer" />
                  <div className="h-5 w-12 rounded skeleton-shimmer mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredServices && filteredServices.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 gap-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                name={service.name}
                description={service.description || 'No description available'}
                price={service.price}
                imageUrl={service.imageUrl || ''}
                category={service.category}
                onAdd={() =>
                  addItem({
                    id: service.id,
                    name: service.name,
                    price: service.price,
                    type: 'SERVICE',
                    imageUrl: service.imageUrl,
                    category: service.category,
                    description: service.description,
                  })
                }
              />
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-8">
            <div className="w-14 h-14 rounded-full bg-[#EBF3ED] flex items-center justify-center mb-4">
              <ConciergeBell className="w-6 h-6 text-[#2D5A3D]" />
            </div>
            <h2 className="text-[16px] font-semibold text-[#1C1C1C] mb-1">No services found</h2>
            <p className="text-[13px] text-[#A1A1A1] text-center max-w-[260px]">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
