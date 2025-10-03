'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Search, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-xl z-10 px-6 py-5 border-b border-gray-100/50 shadow-sm">
        <div className="flex items-center gap-4 mb-5">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center hover:bg-purple-200 transition-all hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 text-purple-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex-1">Services</h1>
          <button
            onClick={() => router.push('/guest/cart')}
            className="relative w-10 h-10 rounded-xl bg-lime-accent flex items-center justify-center hover:bg-lime-accent/90 transition-all hover:scale-105 shadow-md"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 text-base"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                categoryFilter === category
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {/* Services Grid */}
      <div className="px-6 py-6">
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl overflow-hidden shadow-sm h-80 animate-pulse"
              >
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredServices && filteredServices.length > 0 ? (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-[2rem] overflow-hidden hover:shadow-xl transition-all duration-300"
                  style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}
                >
                  <div className="relative h-48">
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-[#c4b5fd] to-[#e0d7ff]"
                      style={{
                        ...(service.imageUrl && {
                          backgroundImage: `linear-gradient(to bottom, rgba(196, 181, 253, 0.1), rgba(224, 215, 255, 0.3)), url(${service.imageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }),
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-1.5 bg-white/95 backdrop-blur-md rounded-full text-xs font-semibold text-gray-800 shadow-sm">
                        {service.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {service.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">
                      {service.description || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-3xl font-bold text-gray-900">
                          ₹{service.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
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
                        className="rounded-full bg-lime-accent hover:bg-lime-accent/80 text-black px-6 h-11 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No services found</p>
          </div>
        )}
      </div>
    </div>
  )
}
