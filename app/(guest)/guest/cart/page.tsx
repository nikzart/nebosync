'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Minus, Trash2, Leaf, Drumstick } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, totalAmount, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Cart</h1>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] px-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Add services or food items to get started
            </p>
            <Button
              onClick={() => router.push('/guest')}
              className="bg-pastel-purple hover:bg-pastel-purple/90"
            >
              Start Shopping
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 pb-32">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900 flex-1">Cart</h1>
          <button
            onClick={clearCart}
            className="text-sm text-red-500 font-medium hover:text-red-600"
          >
            Clear All
          </button>
        </div>
      </header>

      <div className="px-6 py-6">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-4 mb-4 shadow-sm"
            >
              <div className="flex gap-4">
                <div
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pastel-purple to-pastel-lavender flex-shrink-0"
                  style={{
                    ...(item.imageUrl && {
                      backgroundImage: `url(${item.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }),
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                        {item.type === 'FOOD' && item.isVeg !== undefined && (
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              item.isVeg ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          >
                            {item.isVeg ? (
                              <Leaf className="w-3 h-3 text-white" />
                            ) : (
                              <Drumstick className="w-3 h-3 text-white" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-semibold text-gray-900 w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-lime-accent flex items-center justify-center hover:bg-lime-accent/90 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 pb-24">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Total Amount</span>
            <span className="text-3xl font-bold text-gray-900">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <Button
            onClick={() => router.push('/guest/checkout')}
            className="w-full h-14 bg-lime-accent hover:bg-lime-accent/90 text-black text-lg font-semibold rounded-full"
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  )
}
