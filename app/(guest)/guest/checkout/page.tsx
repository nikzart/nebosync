'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, ArrowRight, MessageSquare, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { useCart } from '@/contexts/cart-context'
import { toast } from 'sonner'
import { staggerContainer, staggerItem, tapScale } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface GuestProfile {
  id: string
  name: string
  room: { roomNumber: string } | null
}

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, totalAmount, totalItems, clearCart } = useCart()
  const [isPending, startTransition] = useTransition()
  const [notes, setNotes] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)

  const { data: guest } = useQuery<GuestProfile>({
    queryKey: ['guest-profile'],
    queryFn: async () => {
      const res = await fetch('/api/guest/profile')
      if (!res.ok) return null
      return res.json()
    },
    enabled: !!session?.user,
    staleTime: 60000,
  })

  if (items.length === 0 && !orderPlaced) {
    router.push('/guest/cart')
    return null
  }

  const handlePlaceOrder = async () => {
    startTransition(async () => {
      try {
        const hasFood = items.some((item) => item.type === 'FOOD')
        const hasService = items.some((item) => item.type === 'SERVICE')
        let orderType = 'FOOD'
        if (hasService && !hasFood) {
          orderType = 'ROOM_SERVICE'
        } else if (hasFood && hasService) {
          orderType = 'FOOD'
        }

        const orderItems = items.map((item) => ({
          quantity: item.quantity,
          price: item.price,
          ...(item.type === 'SERVICE'
            ? { serviceId: item.id }
            : { foodMenuId: item.id }),
        }))

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderType,
            items: orderItems,
            specialInstructions: notes || undefined,
          }),
        })

        if (!response.ok) throw new Error('Failed to place order')

        setOrderPlaced(true)
        clearCart()
        toast.success('Order placed successfully!')

        setTimeout(() => {
          router.push('/guest/orders')
        }, 3000)
      } catch (error) {
        console.error('Error placing order:', error)
        toast.error('Failed to place order')
      }
    })
  }

  // ── Success Screen ──
  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center px-8">
        <div className="text-center">
          {/* Animated checkmark circle */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-20 h-20 rounded-full bg-[#2D5A3D] flex items-center justify-center mx-auto mb-6"
            style={{ boxShadow: '0 8px 32px rgba(45,90,61,0.25)' }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Check className="w-9 h-9 text-white" strokeWidth={3} />
            </motion.div>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-[22px] font-bold text-[#1C1C1C] mb-1.5"
          >
            Order Placed!
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-[14px] text-[#6B6B6B] max-w-[240px] mx-auto mb-8"
          >
            We&apos;ll notify you when it&apos;s ready
          </motion.p>

          {/* View Orders button */}
          <motion.button
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            {...tapScale}
            onClick={() => router.push('/guest/orders')}
            className="h-11 px-8 rounded-full bg-[#2D5A3D] text-white text-[14px] font-semibold inline-flex items-center gap-2"
          >
            View Orders
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          {/* Auto-redirect hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.3 }}
            className="text-[12px] text-[#A1A1A1] mt-4"
          >
            Redirecting to orders...
          </motion.p>
        </div>
      </div>
    )
  }

  // ── Checkout Form ──
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
            <h1 className="text-[18px] font-semibold text-[#1C1C1C]">Checkout</h1>
            <p className="text-[12px] text-[#A1A1A1]">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
          </div>
        </div>
      </header>

      <motion.div
        className="px-5 py-4 space-y-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Delivery Info */}
        {guest?.room && (
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-[12px] p-4 flex items-center gap-3"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="w-9 h-9 rounded-[8px] bg-[#EBF3ED] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-[#2D5A3D]" />
            </div>
            <div>
              <p className="text-[11px] text-[#A1A1A1] uppercase tracking-wide">Delivering to</p>
              <p className="text-[14px] font-semibold text-[#1C1C1C]">Room {guest.room.roomNumber}</p>
            </div>
          </motion.div>
        )}

        {/* Order Summary */}
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-[12px] overflow-hidden"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-[16px] font-semibold text-[#1C1C1C] mb-3">Order Summary</h2>
          </div>

          <div className="px-4 space-y-0">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 py-3',
                  index < items.length - 1 && 'border-b border-[#F2F0EC]'
                )}
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-[8px] bg-[#F2F0EC] relative overflow-hidden shrink-0">
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {item.type === 'FOOD' && item.isVeg !== undefined && (
                      <div className={cn(
                        'w-3 h-3 rounded-[2px] border-[1.5px] flex items-center justify-center shrink-0',
                        item.isVeg ? 'border-[#2D5A3D]' : 'border-[#B5403A]'
                      )}>
                        <div className={cn(
                          'w-1 h-1 rounded-full',
                          item.isVeg ? 'bg-[#2D5A3D]' : 'bg-[#B5403A]'
                        )} />
                      </div>
                    )}
                    <p className="text-[14px] font-medium text-[#1C1C1C] truncate">{item.name}</p>
                  </div>
                  {item.category && (
                    <p className="text-[11px] text-[#A1A1A1] mt-0.5">{item.category}</p>
                  )}
                </div>

                {/* Quantity & Price */}
                <div className="text-right shrink-0">
                  <p className="text-[14px] font-semibold text-[#1C1C1C] tabular-nums">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-[#A1A1A1] tabular-nums">
                    ×{item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal */}
          <div className="mx-4 border-t border-dashed border-[#EDECEA] py-3">
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-[#6B6B6B]">Subtotal</span>
              <span className="text-[15px] font-bold text-[#1C1C1C] tabular-nums">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[13px] text-[#6B6B6B]">Taxes & fees</span>
              <span className="text-[12px] text-[#A1A1A1]">Calculated on confirmation</span>
            </div>
          </div>
        </motion.div>

        {/* Notes & Requests */}
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-[12px] p-4"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#EBF3ED] flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-[#2D5A3D]" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-[#1C1C1C]">Notes & Requests</h2>
              <p className="text-[11px] text-[#A1A1A1]">Special instructions or custom requests</p>
            </div>
          </div>
          <textarea
            placeholder="e.g. No onions, extra spicy, deliver by 8pm..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[100px] rounded-[8px] border border-[#EDECEA] p-3 text-[14px] text-[#1C1C1C] placeholder:text-[#A1A1A1] focus:outline-none focus:border-[#2D5A3D] focus:ring-1 focus:ring-[#2D5A3D]/20 transition-colors resize-none bg-[#FAF9F6]"
          />
        </motion.div>
      </motion.div>

      {/* Bottom Bar — Two-part checkout */}
      <div className="fixed bottom-[88px] left-0 right-0 z-40">
        <div className="max-w-md mx-auto px-5">
          {/* Summary Card */}
          <div
            className="bg-white rounded-t-[16px] px-4 pt-3 pb-2 border border-b-0 border-[#EDECEA]"
            style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.04)' }}
          >
            <div className="flex justify-between items-center text-[13px] text-[#6B6B6B] mb-1.5">
              <span>Total ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
              <span className="text-[16px] font-bold text-[#1C1C1C] tabular-nums">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center text-[13px] text-[#6B6B6B]">
              <span>Taxes & fees</span>
              <span className="text-[12px] text-[#A1A1A1]">Calculated on confirmation</span>
            </div>
          </div>

          {/* Place Order Button */}
          <motion.button
            {...tapScale}
            onClick={handlePlaceOrder}
            disabled={isPending}
            className="w-full bg-[#2D5A3D] rounded-b-[16px] h-[52px] flex items-center justify-between px-5 disabled:opacity-50"
            style={{ boxShadow: 'var(--shadow-floating)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[15px] font-semibold text-white">
                {isPending ? 'Placing...' : 'Place Order'}
              </span>
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
