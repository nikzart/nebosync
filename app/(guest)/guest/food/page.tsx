'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Search, ShoppingCart, UtensilsCrossed } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import { ServiceCard } from '@/components/guest/service-card'
import { staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

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

  const vegFilters = [
    { key: 'all', label: 'All' },
    { key: 'veg', label: 'Veg' },
    { key: 'non-veg', label: 'Non-Veg' },
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
          <h1 className="text-[18px] font-semibold text-[#1C1C1C] flex-1">Food Menu</h1>
          <button
            onClick={() => router.push('/guest/cart')}
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
            placeholder="Search food items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-[8px] bg-white border border-[#EDECEA] text-[14px] placeholder:text-[#A1A1A1] focus:outline-none focus:border-[#2D5A3D] focus:ring-1 focus:ring-[#2D5A3D]/20 transition-colors"
          />
        </div>

        {/* Veg/Non-Veg Filter */}
        <div className="flex gap-2 mb-3">
          {vegFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setVegFilter(filter.key)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all',
                vegFilter === filter.key
                  ? filter.key === 'veg'
                    ? 'bg-[#2D5A3D] text-white'
                    : filter.key === 'non-veg'
                    ? 'bg-[#B5403A] text-white'
                    : 'bg-[#1C1C1C] text-white'
                  : 'bg-white text-[#6B6B6B] border border-[#EDECEA]'
              )}
            >
              {filter.key !== 'all' && (
                <div className="w-2 h-2 rounded-full bg-current" />
              )}
              {filter.label}
            </button>
          ))}
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

      {/* Food Items */}
      <div className="px-5 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-[12px] overflow-hidden h-[100px] flex"
                   style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="w-[100px] h-[100px] skeleton-shimmer" />
                <div className="flex-1 p-3 space-y-2">
                  <div className="h-3 w-16 rounded skeleton-shimmer" />
                  <div className="h-4 w-3/4 rounded skeleton-shimmer" />
                  <div className="h-3 w-full rounded skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems && filteredItems.length > 0 ? (
          <motion.div
            className="space-y-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <ServiceCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  description={item.description || 'No description available'}
                  price={item.price}
                  imageUrl={item.imageUrl || ''}
                  category={item.category}
                  isVeg={item.isVeg}
                  onAdd={() =>
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
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-8">
            <div className="w-14 h-14 rounded-full bg-[#EBF3ED] flex items-center justify-center mb-4">
              <UtensilsCrossed className="w-6 h-6 text-[#2D5A3D]" />
            </div>
            <h2 className="text-[16px] font-semibold text-[#1C1C1C] mb-1">No items found</h2>
            <p className="text-[13px] text-[#A1A1A1] text-center max-w-[260px]">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
