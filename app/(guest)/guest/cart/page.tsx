'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import { staggerContainer, staggerItem, tapScale } from '@/lib/motion'
import { cn } from '@/lib/utils'

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, totalAmount, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 bg-[#FAF9F6]/90 backdrop-blur-lg z-10 px-5 pt-3 pb-3 border-b border-[#EDECEA]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-[8px] bg-white flex items-center justify-center"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <ArrowLeft className="w-4 h-4 text-[#1C1C1C]" />
            </button>
            <h1 className="text-[18px] font-semibold text-[#1C1C1C]">Cart</h1>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center py-20 px-8">
          <div className="w-14 h-14 rounded-full bg-[#EBF3ED] flex items-center justify-center mb-4">
            <ShoppingBag className="w-6 h-6 text-[#2D5A3D]" />
          </div>
          <h2 className="text-[16px] font-semibold text-[#1C1C1C] mb-1">Your cart is empty</h2>
          <p className="text-[13px] text-[#A1A1A1] text-center max-w-[260px] mb-6">
            Add services or food items to get started
          </p>
          <motion.button
            {...tapScale}
            onClick={() => router.push('/guest')}
            className="h-10 px-6 rounded-[8px] bg-[#2D5A3D] text-white text-[14px] font-semibold"
          >
            Browse Menu
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 bg-[#FAF9F6]/90 backdrop-blur-lg z-10 px-5 pt-3 pb-3 border-b border-[#EDECEA]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-[8px] bg-white flex items-center justify-center"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <ArrowLeft className="w-4 h-4 text-[#1C1C1C]" />
          </button>
          <h1 className="text-[18px] font-semibold text-[#1C1C1C] flex-1">Cart</h1>
          <button
            onClick={clearCart}
            className="text-[13px] text-[#B5403A] font-medium"
          >
            Clear All
          </button>
        </div>
      </header>

      <div className="px-5 py-4">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                variants={staggerItem}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-[12px] p-3 mb-3"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div className="flex gap-3">
                  <div
                    className="w-16 h-16 rounded-[8px] bg-[#F2F0EC] flex-shrink-0"
                    style={{
                      ...(item.imageUrl && {
                        backgroundImage: `url(${item.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }),
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-[15px] font-semibold text-[#1C1C1C] truncate">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.type === 'FOOD' && item.isVeg !== undefined && (
                            <div className={cn(
                              'w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center',
                              item.isVeg ? 'border-[#2D5A3D]' : 'border-[#B5403A]'
                            )}>
                              <div className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                item.isVeg ? 'bg-[#2D5A3D]' : 'bg-[#B5403A]'
                              )} />
                            </div>
                          )}
                          <span className="text-[11px] text-[#A1A1A1] uppercase tracking-wide">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-[#B5403A]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[15px] font-bold text-[#1C1C1C]">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      <div className="flex items-center gap-3">
                        <motion.button
                          {...tapScale}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-white border border-[#EDECEA] flex items-center justify-center"
                        >
                          <Minus className="w-3.5 h-3.5 text-[#1C1C1C]" />
                        </motion.button>
                        <span className="text-[15px] font-semibold text-[#1C1C1C] w-6 text-center tabular-nums">
                          {item.quantity}
                        </span>
                        <motion.button
                          {...tapScale}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-[#2D5A3D] flex items-center justify-center"
                        >
                          <Plus className="w-3.5 h-3.5 text-white" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Checkout Bar */}
      <div className="fixed bottom-[88px] left-0 right-0 z-40">
        <div className="max-w-md mx-auto px-5 pb-4">
          <div className="bg-[#2D5A3D] rounded-[12px] p-4 flex items-center justify-between"
               style={{ boxShadow: 'var(--shadow-floating)' }}>
            <div>
              <p className="text-[12px] text-white/60">Total</p>
              <p className="text-[20px] font-bold text-white tabular-nums">
                ₹{totalAmount.toLocaleString('en-IN')}
              </p>
            </div>
            <motion.button
              {...tapScale}
              onClick={() => router.push('/guest/checkout')}
              className="h-11 px-6 rounded-[8px] bg-[#C9A96E] text-white text-[15px] font-semibold"
            >
              Checkout
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
