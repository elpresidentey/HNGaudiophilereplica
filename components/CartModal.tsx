"use client"

import { useCart } from '@/context/CartContext'
import Image from 'next/image'
import Link from 'next/link'

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Cart Modal - Positioned like in the design */}
      <div className="fixed top-24 right-6 md:right-12 z-50 bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold uppercase tracking-wider">
              Cart ({cart.length})
            </h3>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-dark/60 hover:text-primary text-sm underline transition-colors"
              >
                Remove all
              </button>
            )}
          </div>

          {/* Cart Content */}
          {cart.length === 0 ? (
            <p className="text-center py-8 text-dark/60">Your cart is empty</p>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-6 max-h-64 overflow-y-auto mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    {/* Product Image */}
                    <div className="relative w-16 h-16 bg-light rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate mb-1">
                        {item.name}
                      </h4>
                      <p className="text-dark/60 text-sm">
                        ${item.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 bg-light px-3 py-2 rounded">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-dark/60 hover:text-primary font-bold text-sm w-4 h-4 flex items-center justify-center"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="font-bold text-sm min-w-[1rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-dark/60 hover:text-primary font-bold text-sm w-4 h-4 flex items-center justify-center"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-dark/60 uppercase text-sm">Total</span>
                <span className="text-lg font-bold">
                  ${totalPrice.toLocaleString()}
                </span>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={onClose}
                className="block w-full bg-primary hover:bg-primary-light text-white text-center py-4 uppercase tracking-wider text-sm font-bold transition-colors"
              >
                Checkout
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

