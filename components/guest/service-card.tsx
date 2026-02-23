'use client'

import { useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
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

interface FlyingItem {
  id: number
  x: number
  y: number
  w: number
  h: number
  targetX: number
  targetY: number
  imageUrl: string
}

export function ServiceCard({ id, name, description, price, imageUrl, category, isVeg, onAdd }: ServiceCardProps) {
  const { items, updateQuantity } = useCart()
  const cartItem = items.find((i) => i.id === id)
  const quantity = cartItem?.quantity ?? 0
  const imageRef = useRef<HTMLDivElement>(null)
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([])

  const triggerFlyAnimation = useCallback(() => {
    if (!imageRef.current) return

    const imageRect = imageRef.current.getBoundingClientRect()
    const cartIcon = document.querySelector('[data-cart-icon]')
    if (!cartIcon) return

    const cartRect = cartIcon.getBoundingClientRect()

    const flyItem: FlyingItem = {
      id: Date.now(),
      x: imageRect.left,
      y: imageRect.top,
      w: imageRect.width,
      h: imageRect.height,
      targetX: cartRect.left + cartRect.width / 2 - 20,
      targetY: cartRect.top + cartRect.height / 2 - 20,
      imageUrl,
    }

    setFlyingItems((prev) => [...prev, flyItem])

    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((f) => f.id !== flyItem.id))
    }, 900)
  }, [imageUrl])

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    triggerFlyAnimation()
    onAdd?.()
  }, [onAdd, triggerFlyAnimation])

  const handleIncrement = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onAdd?.()
  }, [onAdd])

  const handleDecrement = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateQuantity(id, quantity - 1)
  }, [id, quantity, updateQuantity])

  return (
    <>
      <motion.div
        layout
        layoutId={id}
        variants={staggerItem}
        exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
        className="bg-white rounded-[12px] overflow-hidden"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {/* Image */}
        <div ref={imageRef} className="relative w-full h-[120px] bg-[#F2F0EC]">
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
                  onClick={handleDecrement}
                  className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <Minus className="w-3 h-3 text-white" />
                </motion.button>
                <span className="text-[13px] font-bold text-white w-4 text-center tabular-nums">
                  {quantity}
                </span>
                <motion.button
                  {...tapScale}
                  onClick={handleIncrement}
                  className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <Plus className="w-3 h-3 text-white" />
                </motion.button>
              </div>
            ) : (
              onAdd && (
                <motion.button
                  {...tapScale}
                  onClick={handleAdd}
                  className="h-8 px-4 rounded-full bg-[#2D5A3D] text-white text-[12px] font-semibold"
                >
                  Add
                </motion.button>
              )
            )}
          </div>
        </div>
      </motion.div>

      {/* Flying thumbnails — rendered in portal */}
      {typeof document !== 'undefined' && flyingItems.map((item) => (
        createPortal(
          <div key={item.id} className="fixed inset-0 z-[9999] pointer-events-none">
            {/* Main flying element */}
            <motion.div
              initial={{
                left: item.x,
                top: item.y,
                width: item.w,
                height: item.h,
              }}
              animate={{
                left: item.targetX,
                top: item.targetY,
                width: 40,
                height: 40,
              }}
              transition={{
                duration: 0.75,
                ease: [0.32, 0, 0.24, 1],
              }}
              className="absolute"
              style={{ willChange: 'transform' }}
            >
              {/* Inner container for scale pop + rotate + opacity */}
              <motion.div
                initial={{ scale: 1, rotate: 0, opacity: 1, borderRadius: 12 }}
                animate={{ scale: [1, 1.15, 1, 0.5], rotate: [0, -8, 5, 0], opacity: [1, 1, 0.9, 0], borderRadius: 20 }}
                transition={{
                  duration: 0.75,
                  ease: 'easeInOut',
                  times: [0, 0.2, 0.6, 1],
                }}
                className="w-full h-full overflow-hidden bg-[#F2F0EC]"
                style={{
                  boxShadow: '0 8px 32px rgba(45,90,61,0.3), 0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt=""
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                )}
              </motion.div>
            </motion.div>
          </div>,
          document.body
        )
      ))}
    </>
  )
}
