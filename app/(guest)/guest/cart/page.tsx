'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import { tapScale } from '@/lib/motion'
import { cn } from '@/lib/utils'

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, totalAmount, totalItems, clearCart } = useCart()

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

        <div className="flex flex-col items-center justify-center py-24 px-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-20 h-20 rounded-full bg-[#EBF3ED] flex items-center justify-center mb-5"
          >
            <ShoppingBag className="w-8 h-8 text-[#2D5A3D]" />
          </motion.div>
          <motion.h2
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-[18px] font-semibold text-[#1C1C1C] mb-1"
          >
            Your cart is empty
          </motion.h2>
          <motion.p
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="text-[14px] text-[#A1A1A1] text-center max-w-[240px] mb-8"
          >
            Browse our menu and add items to get started
          </motion.p>
          <motion.button
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            {...tapScale}
            onClick={() => router.push('/guest/food')}
            className="h-11 px-8 rounded-full bg-[#2D5A3D] text-white text-[14px] font-semibold flex items-center gap-2"
          >
            Browse Menu
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-[180px]">
      {/* Header */}
      <header className="sticky top-0 bg-[#FAF9F6]/90 backdrop-blur-lg z-10 px-5 pt-3 pb-3 border-b border-[#EDECEA]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-[8px] bg-white flex items-center justify-center"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <ArrowLeft className="w-4 h-4 text-[#1C1C1C]" />
          </button>
          <div className="flex-1">
            <h1 className="text-[18px] font-semibold text-[#1C1C1C]">Cart</h1>
            <p className="text-[12px] text-[#A1A1A1]">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
          </div>
          <button
            onClick={clearCart}
            className="text-[13px] text-[#B5403A] font-medium"
          >
            Clear
          </button>
        </div>
      </header>

      {/* Cart Items */}
      <div className="px-5 pt-4">
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -80, transition: { duration: 0.25 } }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              className="mb-3"
            >
              <div className="bg-white rounded-[12px] overflow-hidden"
                   style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="flex">
                  {/* Item Image */}
                  <div className="w-[88px] self-stretch shrink-0 bg-[#F2F0EC] relative overflow-hidden">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="88px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-[14px] font-semibold text-[#1C1C1C] truncate">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.type === 'FOOD' && item.isVeg !== undefined && (
                            <div className={cn(
                              'w-3 h-3 rounded-[2px] border-[1.5px] flex items-center justify-center',
                              item.isVeg ? 'border-[#2D5A3D]' : 'border-[#B5403A]'
                            )}>
                              <div className={cn(
                                'w-1 h-1 rounded-full',
                                item.isVeg ? 'bg-[#2D5A3D]' : 'bg-[#B5403A]'
                              )} />
                            </div>
                          )}
                          <span className="text-[11px] text-[#A1A1A1]">
                            ₹{item.price.toLocaleString('en-IN')} each
                          </span>
                        </div>
                      </div>
                      <motion.button
                        {...tapScale}
                        onClick={() => removeItem(item.id)}
                        className="w-7 h-7 rounded-full bg-[#FDF1F0] flex items-center justify-center shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#B5403A]" />
                      </motion.button>
                    </div>

                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[16px] font-bold text-[#1C1C1C] tabular-nums">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2 bg-[#FAF9F6] rounded-full h-8 px-0.5 border border-[#EDECEA]">
                        <motion.button
                          {...tapScale}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-white flex items-center justify-center"
                          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}
                        >
                          <Minus className="w-3 h-3 text-[#1C1C1C]" />
                        </motion.button>
                        <span className="text-[14px] font-bold text-[#1C1C1C] w-5 text-center tabular-nums">
                          {item.quantity}
                        </span>
                        <motion.button
                          {...tapScale}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-[#2D5A3D] flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3 text-white" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Order Summary + Checkout */}
      <div className="fixed bottom-[88px] left-0 right-0 z-40">
        <div className="max-w-md mx-auto px-5">
          {/* Summary Card */}
          <div className="bg-white rounded-t-[16px] px-4 pt-3 pb-2 border border-b-0 border-[#EDECEA]"
               style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.04)' }}>
            <div className="flex justify-between items-center text-[13px] text-[#6B6B6B] mb-1.5">
              <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
              <span className="tabular-nums">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-[13px] text-[#6B6B6B]">
              <span>Taxes & fees</span>
              <span className="text-[12px] text-[#A1A1A1]">Calculated at checkout</span>
            </div>
          </div>

          {/* Checkout Button */}
          <motion.button
            {...tapScale}
            onClick={() => router.push('/guest/checkout')}
            className="w-full bg-[#2D5A3D] rounded-b-[16px] h-[52px] flex items-center justify-between px-5"
            style={{ boxShadow: 'var(--shadow-floating)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[15px] font-semibold text-white">Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-bold text-white tabular-nums">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
              <ArrowRight className="w-4 h-4 text-white/60" />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
