'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import { toast } from 'sonner'
import { tapScale } from '@/lib/motion'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalAmount, clearCart } = useCart()
  const [isPending, startTransition] = useTransition()
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [requestMessage, setRequestMessage] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)

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
            specialInstructions: specialInstructions || undefined,
            requestMessage: requestMessage || undefined,
          }),
        })

        if (!response.ok) throw new Error('Failed to place order')

        setOrderPlaced(true)
        clearCart()
        toast.success('Order placed successfully!')

        setTimeout(() => {
          router.push('/guest/orders')
        }, 2000)
      } catch (error) {
        console.error('Error placing order:', error)
        toast.error('Failed to place order', {
          description: 'Please try again later',
        })
      }
    })
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            className="w-16 h-16 rounded-full bg-[#EBF3ED] flex items-center justify-center mx-auto mb-4"
          >
            <Check className="w-8 h-8 text-[#2D5A3D]" />
          </motion.div>
          <h2 className="text-[20px] font-semibold text-[#1C1C1C] mb-1">Order Placed</h2>
          <p className="text-[14px] text-[#6B6B6B]">We&apos;ll notify you when it&apos;s ready</p>
        </motion.div>
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
          <h1 className="text-[18px] font-semibold text-[#1C1C1C]">Checkout</h1>
        </div>
      </header>

      <div className="px-5 py-4 space-y-4">
        {/* Order Summary */}
        <div className="bg-white rounded-[12px] p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h2 className="text-[16px] font-semibold text-[#1C1C1C] mb-3">Order Summary</h2>
          <div className="space-y-2.5">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-[#1C1C1C]">{item.name}</p>
                  <p className="text-[12px] text-[#A1A1A1]">
                    {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                  </p>
                </div>
                <p className="text-[14px] font-semibold text-[#1C1C1C] tabular-nums">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-[#EDECEA] mt-3 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#6B6B6B]">Total</span>
              <span className="text-[18px] font-bold text-[#1C1C1C] tabular-nums">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        <div className="bg-white rounded-[12px] p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h2 className="text-[16px] font-semibold text-[#1C1C1C] mb-3">Special Instructions</h2>
          <textarea
            placeholder="Add any special requests..."
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            className="w-full min-h-[80px] rounded-[8px] border border-[#EDECEA] p-3 text-[14px] placeholder:text-[#A1A1A1] focus:outline-none focus:border-[#2D5A3D] focus:ring-1 focus:ring-[#2D5A3D]/20 transition-colors resize-none"
          />
        </div>

        {/* Custom Request */}
        <div className="bg-white rounded-[12px] p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h2 className="text-[16px] font-semibold text-[#1C1C1C] mb-3">Custom Request</h2>
          <textarea
            placeholder="Need something not on the menu? Let us know..."
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            className="w-full min-h-[80px] rounded-[8px] border border-[#EDECEA] p-3 text-[14px] placeholder:text-[#A1A1A1] focus:outline-none focus:border-[#2D5A3D] focus:ring-1 focus:ring-[#2D5A3D]/20 transition-colors resize-none"
          />
        </div>
      </div>

      {/* Place Order Button */}
      <div className="fixed bottom-[88px] left-0 right-0 z-40">
        <div className="max-w-md mx-auto px-5 pb-4">
          <motion.button
            {...tapScale}
            onClick={handlePlaceOrder}
            disabled={isPending}
            className="w-full h-12 rounded-[8px] bg-[#2D5A3D] text-white text-[15px] font-semibold disabled:opacity-50"
          >
            {isPending ? 'Placing Order...' : `Place Order · ₹${totalAmount.toLocaleString('en-IN')}`}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
