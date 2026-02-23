'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { staggerItem, tapScale } from '@/lib/motion'
import { useCart } from '@/contexts/cart-context'
import { cn } from '@/lib/utils'

interface ServiceCardProps {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  isVeg?: boolean | null
  onAdd?: () => void
}

export function ServiceCard({ id, name, description, price, imageUrl, category, isVeg, onAdd }: ServiceCardProps) {
  const { items, updateQuantity } = useCart()
  const cartItem = items.find((i) => i.id === id)
  const quantity = cartItem?.quantity ?? 0

  return (
    <motion.div
      variants={staggerItem}
      className="bg-white rounded-[12px] overflow-hidden"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Image */}
      <div className="relative w-full h-[120px] bg-[#F2F0EC]">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 448px) 50vw, 224px"
            loading="lazy"
            className="object-cover"
          />
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          {isVeg !== undefined && isVeg !== null && (
            <div className={cn(
              'w-4 h-4 rounded-[3px] border-[1.5px] flex items-center justify-center bg-white',
              isVeg ? 'border-[#2D5A3D]' : 'border-[#B5403A]'
            )}>
              <div className={cn(
                'w-1.5 h-1.5 rounded-full',
                isVeg ? 'bg-[#2D5A3D]' : 'bg-[#B5403A]'
              )} />
            </div>
          )}
          <span className="px-1.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-medium text-[#1C1C1C]">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="text-[14px] font-semibold text-[#1C1C1C] leading-tight truncate">{name}</h4>
        <p className="text-[12px] text-[#6B6B6B] line-clamp-2 mt-0.5">{description}</p>

        <div className="flex items-center justify-between mt-2.5">
          <span className="text-[15px] font-bold text-[#1C1C1C]">
            ₹{price.toLocaleString('en-IN')}
          </span>

          {quantity > 0 ? (
            <div className="flex items-center gap-2 bg-[#2D5A3D] rounded-full h-8 px-0.5">
              <motion.button
                {...tapScale}
                onClick={(e) => { e.preventDefault(); updateQuantity(id, quantity - 1) }}
                className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
              >
                <Minus className="w-3 h-3 text-white" />
              </motion.button>
              <span className="text-[13px] font-bold text-white w-4 text-center tabular-nums">
                {quantity}
              </span>
              <motion.button
                {...tapScale}
                onClick={(e) => { e.preventDefault(); onAdd?.() }}
                className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
              >
                <Plus className="w-3 h-3 text-white" />
              </motion.button>
            </div>
          ) : (
            onAdd && (
              <motion.button
                {...tapScale}
                onClick={(e) => { e.preventDefault(); onAdd() }}
                className="h-8 px-4 rounded-full bg-[#2D5A3D] text-white text-[12px] font-semibold"
              >
                Add
              </motion.button>
            )
          )}
        </div>
      </div>
    </motion.div>
  )
}
