'use client'

import { CartProvider } from '@/contexts/cart-context'
import { ReactNode } from 'react'

export function CartProviderWrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>
}
