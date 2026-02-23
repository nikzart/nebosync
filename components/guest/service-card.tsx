'use client'

import { motion } from 'framer-motion'
import { staggerItem, tapScale } from '@/lib/motion'
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

export function ServiceCard({ name, description, price, imageUrl, category, isVeg, onAdd }: ServiceCardProps) {
  return (
    <motion.div
      variants={staggerItem}
      className="bg-white rounded-[12px] overflow-hidden"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex">
        {/* Image — square, left side */}
        <div
          className="w-[100px] h-[100px] shrink-0 bg-[#F2F0EC]"
          style={{
            ...(imageUrl && {
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }),
          }}
        />
        {/* Content — right side */}
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              {isVeg !== undefined && isVeg !== null && (
                <div className={cn(
                  'w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center',
                  isVeg ? 'border-[#2D5A3D]' : 'border-[#B5403A]'
                )}>
                  <div className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    isVeg ? 'bg-[#2D5A3D]' : 'bg-[#B5403A]'
                  )} />
                </div>
              )}
              <span className="text-[11px] font-medium text-[#A1A1A1] uppercase tracking-wide">
                {category}
              </span>
            </div>
            <h4 className="text-[15px] font-semibold text-[#1C1C1C] truncate">{name}</h4>
            <p className="text-[13px] text-[#6B6B6B] line-clamp-1 mt-0.5">{description}</p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[16px] font-bold text-[#1C1C1C]">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {onAdd && (
              <motion.button
                {...tapScale}
                onClick={onAdd}
                className="h-8 px-4 rounded-full bg-[#2D5A3D] text-white text-[13px] font-semibold"
              >
                Add
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
