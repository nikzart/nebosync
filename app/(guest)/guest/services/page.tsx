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
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900 flex-1">Services</h1>
          <button
            onClick={() => router.push('/guest/cart')}
            className="relative w-10 h-10 rounded-full bg-lime-accent flex items-center justify-center hover:bg-lime-accent/90 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-full bg-gray-50 border-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                categoryFilter === category
                  ? 'bg-pastel-purple text-white'
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
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48">
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-pastel-purple to-pastel-lavender"
                      style={{
                        ...(service.imageUrl && {
                          backgroundImage: `url(${service.imageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }),
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                        {service.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {service.name}
                    </h4>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {service.description || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{service.price.toLocaleString('en-IN')}
                      </span>
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
                        className="rounded-full bg-lime-accent hover:bg-lime-accent/90 text-black px-6 h-12"
                      >
                        Add to Cart
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
