'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useCart } from '@/contexts/cart-context'
import { toast } from 'sonner'

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
        // Determine order type based on items
        const hasFood = items.some((item) => item.type === 'FOOD')
        const hasService = items.some((item) => item.type === 'SERVICE')
        let orderType = 'FOOD'
        if (hasService && !hasFood) {
          orderType = 'SERVICE'
        } else if (hasFood && hasService) {
          orderType = 'FOOD'
        }

        // Prepare order items
        const orderItems = items.map((item) => ({
          quantity: item.quantity,
          price: item.price,
          ...(item.type === 'SERVICE'
            ? { serviceId: item.id }
            : { foodMenuId: item.id }),
        }))

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderType,
            items: orderItems,
            specialInstructions: specialInstructions || undefined,
            requestMessage: requestMessage || undefined,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to place order')
        }

        const order = await response.json()
        setOrderPlaced(true)
        clearCart()
        toast.success('Order placed successfully!')

        // Redirect to orders page after 2 seconds
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Order Placed!
          </h2>
          <p className="text-gray-600 mb-4">
            Your order has been successfully placed.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to your orders...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 pb-32">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Checkout</h1>
        </div>
      </header>

      <div className="px-6 py-6 space-y-6">
        {/* Order Summary */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Order Summary
          </h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Special Instructions
          </h2>
          <Textarea
            placeholder="Add any special requests or instructions for your order..."
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            className="min-h-[100px] rounded-2xl"
          />
        </div>

        {/* Custom Request */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Custom Request (Optional)
          </h2>
          <Textarea
            placeholder="Need something not on the menu? Let us know..."
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            className="min-h-[100px] rounded-2xl"
          />
        </div>
      </div>

      {/* Place Order Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 pb-24">
        <div className="max-w-md mx-auto">
          <Button
            onClick={handlePlaceOrder}
            disabled={isPending}
            className="w-full h-14 bg-lime-accent hover:bg-lime-accent/90 text-black text-lg font-semibold rounded-full"
          >
            {isPending ? 'Placing Order...' : `Place Order · ₹${totalAmount.toLocaleString('en-IN')}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
