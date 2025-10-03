'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Search, Leaf, Drumstick, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'

interface FoodItem {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  category: string
  isVeg: boolean
  isAvailable: boolean
}

export default function FoodMenuPage() {
  const router = useRouter()
  const { addItem, totalItems } = useCart()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [vegFilter, setVegFilter] = useState<string>('all')

  const { data: foodItems, isLoading } = useQuery<FoodItem[]>({
    queryKey: ['food-menu', categoryFilter, vegFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('available', 'true')
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter)
      }
      if (vegFilter === 'veg') {
        params.append('isVeg', 'true')
      } else if (vegFilter === 'non-veg') {
        params.append('isVeg', 'false')
      }
      const res = await fetch(`/api/food-menu?${params}`)
      if (!res.ok) throw new Error('Failed to fetch food menu')
      return res.json()
    },
  })

  const filteredItems = foodItems?.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categories = [
    'all',
    ...Array.from(new Set(foodItems?.map((item) => item.category) || [])),
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
          <h1 className="text-3xl font-bold text-gray-900 flex-1">Food Menu</h1>
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
            placeholder="Search food items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 text-base"
          />
        </div>

        {/* Veg/Non-Veg Filter */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setVegFilter('all')}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              vegFilter === 'all'
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setVegFilter('veg')}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              vegFilter === 'veg'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Leaf className="w-4 h-4" />
            Veg
          </button>
          <button
            onClick={() => setVegFilter('non-veg')}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              vegFilter === 'non-veg'
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Drumstick className="w-4 h-4" />
            Non-Veg
          </button>
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

      {/* Food Items Grid */}
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
        ) : filteredItems && filteredItems.length > 0 ? (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48">
                    <div
                      className="absolute inset-0"
                      style={{
                        background: item.imageUrl
                          ? `url(${item.imageUrl})`
                          : 'linear-gradient(135deg, #c4b5fd 0%, #e0d7ff 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                        {item.category}
                      </span>
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          item.isVeg
                            ? 'bg-green-500/90 backdrop-blur-sm'
                            : 'bg-red-500/90 backdrop-blur-sm'
                        }`}
                      >
                        {item.isVeg ? (
                          <Leaf className="w-4 h-4 text-white" />
                        ) : (
                          <Drumstick className="w-4 h-4 text-white" />
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {item.description || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                      <Button
                        size="sm"
                        onClick={() =>
                          addItem({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            type: 'FOOD',
                            imageUrl: item.imageUrl,
                            category: item.category,
                            description: item.description,
                            isVeg: item.isVeg,
                          })
                        }
                        className="rounded-full bg-lime-accent hover:bg-lime-accent/90 text-black px-6 h-11 font-semibold"
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
            <p className="text-gray-500 text-lg">No food items found</p>
          </div>
        )}
      </div>
    </div>
  )
}
