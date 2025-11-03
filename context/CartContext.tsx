"use client"

import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react'
import { usePerformanceMonitor } from '@/lib/performanceMonitor'

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  slug: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeFromCart: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const performanceMonitor = usePerformanceMonitor()

  // Performance monitoring for cart operations
  useEffect(() => {
    performanceMonitor.record('cart_provider_mount', Date.now())
  }, [performanceMonitor])

  // Optimized cart operations with useCallback to prevent unnecessary re-renders
  const addToCart = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const startTime = performance.now()
    
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      let newCart: CartItem[]
      
      if (existing) {
        newCart = prev.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        )
      } else {
        newCart = [...prev, { ...item, quantity: item.quantity || 1 }]
      }
      
      // Track cart operation performance with enhanced metrics
      const duration = performance.now() - startTime
      performanceMonitor.record('cart_add_item', duration, {
        itemId: item.id,
        itemName: item.name,
        cartSize: newCart.length,
        operation: existing ? 'update' : 'add',
        newQuantity: existing ? existing.quantity + (item.quantity || 1) : (item.quantity || 1),
        cartValue: newCart.reduce((sum, i) => sum + i.price * i.quantity, 0)
      })
      
      return newCart
    })
  }, [performanceMonitor])

  const removeFromCart = useCallback((id: number) => {
    const startTime = performance.now()
    
    setCart(prev => {
      const removedItem = prev.find(item => item.id === id)
      const newCart = prev.filter(item => item.id !== id)
      
      // Track cart operation performance with enhanced metrics
      const duration = performance.now() - startTime
      performanceMonitor.record('cart_remove_item', duration, {
        itemId: id,
        itemName: removedItem?.name,
        removedQuantity: removedItem?.quantity,
        cartSize: newCart.length,
        cartValue: newCart.reduce((sum, i) => sum + i.price * i.quantity, 0)
      })
      
      return newCart
    })
  }, [performanceMonitor])

  const updateQuantity = useCallback((id: number, quantity: number) => {
    const startTime = performance.now()
    
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    
    setCart(prev => {
      const oldItem = prev.find(item => item.id === id)
      const newCart = prev.map(item => (item.id === id ? { ...item, quantity } : item))
      
      // Track cart operation performance with enhanced metrics
      const duration = performance.now() - startTime
      performanceMonitor.record('cart_update_quantity', duration, {
        itemId: id,
        itemName: oldItem?.name,
        oldQuantity: oldItem?.quantity,
        newQuantity: quantity,
        quantityDelta: quantity - (oldItem?.quantity || 0),
        cartSize: newCart.length,
        cartValue: newCart.reduce((sum, i) => sum + i.price * i.quantity, 0)
      })
      
      return newCart
    })
  }, [removeFromCart, performanceMonitor])

  const clearCart = useCallback(() => {
    const startTime = performance.now()
    const previousSize = cart.length
    const previousValue = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    
    setCart([])
    
    // Track cart clear performance with enhanced metrics
    const duration = performance.now() - startTime
    performanceMonitor.record('cart_clear', duration, {
      previousSize,
      previousValue,
      clearedItems: cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity }))
    })
  }, [cart, performanceMonitor])

  // Memoized calculations to prevent unnecessary recalculations with enhanced performance tracking
  const cartMetrics = useMemo(() => {
    const startTime = performance.now()
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    
    // Calculate additional metrics for performance analysis
    const avgItemPrice = cart.length > 0 ? totalPrice / totalItems : 0
    const uniqueItems = cart.length
    const maxQuantity = cart.length > 0 ? Math.max(...cart.map(item => item.quantity)) : 0
    
    // Track calculation performance with enhanced metrics
    const duration = performance.now() - startTime
    performanceMonitor.record('cart_calculations', duration, {
      itemCount: cart.length,
      totalItems,
      totalPrice,
      avgItemPrice,
      uniqueItems,
      maxQuantity,
      calculationComplexity: cart.length * 2 // Simple complexity metric
    })
    
    return { totalItems, totalPrice }
  }, [cart, performanceMonitor])

  const { totalItems, totalPrice } = cartMetrics

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
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

