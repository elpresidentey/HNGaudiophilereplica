"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
}

interface OrderData {
  orderId: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  customerName: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  zipCode: string
  paymentMethod: 'e-money' | 'cash'
  orderSaved: boolean
  emailSent: boolean
  timestamp: number
}

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      try {
        const storedOrder = sessionStorage.getItem(`order-${orderId}`)
        if (storedOrder) {
          const parsedOrder = JSON.parse(storedOrder)
          setOrderData(parsedOrder)
        }
      } catch (error) {
        console.error('Failed to retrieve order data:', error)
      }
    }
    setLoading(false)
  }, [orderId])

  if (loading) {
    return (
      <main>
        <Header />
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!orderData) {
    return (
      <main>
        <Header />
        <div className="container mx-auto px-6 py-12">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-6">
              We couldn't find your order details. This might happen if you refreshed the page or the order data expired.
            </p>
            <Link 
              href="/" 
              className="inline-block bg-primary text-white px-8 py-4 uppercase tracking-wider font-bold hover:bg-primary-light transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main>
      <Header />
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Thank You for Your Order!</h1>
            <p className="text-gray-600 text-lg">
              Your order has been successfully placed and is being processed.
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6 md:p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Information */}
              <div>
                <h2 className="text-xl font-bold mb-4">Order Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-mono font-medium">{orderData.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>{new Date(orderData.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="capitalize">
                      {orderData.paymentMethod === 'e-money' ? 'e-Money' : 'Cash on Delivery'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Processing
                    </span>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-3">Order Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <div className={`w-2 h-2 rounded-full mr-3 ${orderData.orderSaved ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={orderData.orderSaved ? 'text-green-700' : 'text-gray-500'}>
                        Order saved to database
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className={`w-2 h-2 rounded-full mr-3 ${orderData.emailSent ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className={orderData.emailSent ? 'text-green-700' : 'text-yellow-700'}>
                        {orderData.emailSent ? 'Confirmation email sent' : 'Confirmation email pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h2 className="text-xl font-bold mb-4">Shipping Details</h2>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">{orderData.customerName}</span>
                  </div>
                  <div className="text-gray-600">
                    {orderData.address}
                  </div>
                  <div className="text-gray-600">
                    {orderData.city}, {orderData.zipCode}
                  </div>
                  <div className="text-gray-600">
                    {orderData.country}
                  </div>
                  <div className="text-gray-600 pt-2">
                    <div>Email: {orderData.email}</div>
                    <div>Phone: {orderData.phone}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border p-6 md:p-8 mb-8">
            <h2 className="text-xl font-bold mb-6">Order Items</h2>
            <div className="space-y-4">
              {orderData.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4 border-b last:border-b-0">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="rounded-lg object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-600">${item.price.toLocaleString()} each</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                    <div className="font-medium">${(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="mt-6 pt-6 border-t">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>${orderData.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span>${orderData.shipping}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (VAT):</span>
                  <span>${orderData.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-primary">${orderData.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-lg p-6 md:p-8 mb-8">
            <h2 className="text-xl font-bold mb-4">What's Next?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Order Confirmation</h3>
                  <p className="text-sm text-gray-600">
                    {orderData.emailSent 
                      ? `We've sent a confirmation email to ${orderData.email} with your order details.`
                      : `We'll send a confirmation email to ${orderData.email} shortly with your order details.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Processing</h3>
                  <p className="text-sm text-gray-600">
                    Your order is being prepared for shipment. This typically takes 1-2 business days.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h3 className="font-medium">Delivery</h3>
                  <p className="text-sm text-gray-600">
                    {orderData.paymentMethod === 'cash' 
                      ? 'Our courier will contact you to arrange delivery and collect payment.'
                      : 'Your order will be shipped to your address within 3-5 business days.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="text-center">
            <Link 
              href="/" 
              className="inline-block bg-primary text-white px-8 py-4 uppercase tracking-wider font-bold hover:bg-primary-light transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 mr-4"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => window.print()}
              className="inline-block bg-gray-600 text-white px-8 py-4 uppercase tracking-wider font-bold hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2"
            >
              Print Order
            </button>
          </div>

          {/* Support Information */}
          <div className="mt-12 text-center text-sm text-gray-600">
            <p className="mb-2">
              Need help with your order? Contact our support team:
            </p>
            <p>
              Email: <a href="mailto:support@audiophile.com" className="text-primary hover:underline">support@audiophile.com</a> | 
              Phone: <a href="tel:+1234567890" className="text-primary hover:underline">+1 (234) 567-8900</a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}