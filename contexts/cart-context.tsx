'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'sonner'

export type CartItemType = 'SERVICE' | 'FOOD'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  type: CartItemType
  imageUrl?: string | null
  category?: string
  description?: string | null
  isVeg?: boolean
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalAmount: number
  totalItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('nebosync-cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('nebosync-cart', JSON.stringify(items))
  }, [items])

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    const existing = items.find((i) => i.id === item.id)
    if (existing) {
      setItems((currentItems) =>
        currentItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      )
      toast.success('Updated quantity')
    } else {
      setItems((currentItems) => [...currentItems, { ...item, quantity: 1 }])
      toast.success('Added to cart')
    }
  }

  const removeItem = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id))
    toast.success('Removed from cart')
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem('nebosync-cart')
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalAmount,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
