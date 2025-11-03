"use client"

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

interface ItemAddedModalProps {
  isOpen: boolean
  onClose: () => void
  addedItem: {
    id: number
    name: string
    price: number
    image: string
    quantity: number
  } | null
}

export default function ItemAddedModal({ isOpen, onClose, addedItem }: ItemAddedModalProps) {
  const { totalItems, totalPrice } = useCart()

  // Auto close after 3 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !addedItem) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-auto animate-bounce-in">
          {/* Success Icon */}
          <div className="text-center pt-8 pb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Added to Cart!</h2>
            <p className="text-gray-600 text-sm">Successfully added to your shopping cart</p>
          </div>

          {/* Added Item Details */}
          <div className="px-6 pb-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-4">
                {/* Product Image */}
                <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={addedItem.image}
                    alt={addedItem.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {addedItem.name}
                  </h3>
                  <p className="text-primary font-bold text-sm">
                    ${addedItem.price.toLocaleString()}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Quantity: {addedItem.quantity}
                  </p>
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Cart Total ({totalItems} items)</span>
                <span className="font-bold text-gray-900">${totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/checkout"
                onClick={onClose}
                className="block w-full bg-primary hover:bg-primary-light text-white text-center py-3 rounded-lg font-semibold uppercase tracking-wider transition-colors text-sm"
              >
                Proceed to Checkout
              </Link>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onClose()
                    // You can add logic here to open cart modal if needed
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-3 rounded-lg font-semibold transition-colors text-sm"
                >
                  View Cart
                </button>
                
                <button
                  onClick={onClose}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-3 rounded-lg font-semibold transition-colors text-sm"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-500">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Auto-close indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
            <div className="h-full bg-primary animate-[shrink_3s_linear_forwards]"></div>
          </div>
        </div>
      </div>
    </>
  )
}