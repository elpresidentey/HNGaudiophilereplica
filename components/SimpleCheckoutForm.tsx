"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCart } from '@/context/CartContext'

// Simple validation schema
const checkoutSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  paymentMethod: z.enum(['e-money', 'cash']),
  eMoneyNumber: z.string().optional(),
  eMoneyPIN: z.string().optional(),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export default function SimpleCheckoutForm() {
  const router = useRouter()
  const { cart, clearCart, totalPrice } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onBlur',
  })

  const paymentMethod = watch('paymentMethod')

  // Calculate totals
  const subtotal = totalPrice
  const shipping = 50
  const tax = Math.round(subtotal * 0.2)
  const total = subtotal + shipping + tax

  const onSubmit = async (data: CheckoutFormData) => {
    if (cart.length === 0) {
      setError('Your cart is empty')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Generate order ID
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

      // Try to send email (but don't fail the order if it doesn't work)
      let emailSent = false
      try {
        const emailResponse = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            name: data.name,
            orderId,
            items: cart,
            total,
            shipping,
            subtotal,
            tax,
            address: data.address,
            city: data.city,
            country: data.country,
            zipCode: data.zipCode,
          }),
        })

        if (emailResponse.ok) {
          emailSent = true
        } else {
          console.warn('Email sending failed, but order will continue')
        }
      } catch (emailError) {
        console.warn('Email service unavailable, but order will continue:', emailError)
      }

      // Store order data
      const orderData = {
        orderId,
        items: cart,
        subtotal,
        shipping,
        tax,
        total,
        customerName: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        zipCode: data.zipCode,
        paymentMethod: data.paymentMethod,
        emailSent,
        orderSaved: true,
        timestamp: Date.now(),
      }

      sessionStorage.setItem(`order-${orderId}`, JSON.stringify(orderData))

      // Clear cart and redirect
      clearCart()
      
      // Add email status to URL if email failed
      const confirmationUrl = emailSent 
        ? `/checkout/confirmation?orderId=${orderId}`
        : `/checkout/confirmation?orderId=${orderId}&emailFailed=true`
      
      router.push(confirmationUrl)
    } catch (err: any) {
      console.error('Order submission failed:', err)
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
        <a href="/" className="bg-primary text-white px-8 py-4 uppercase tracking-wider font-bold hover:bg-primary-light">
          Continue Shopping
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        {/* Billing Details */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold uppercase mb-6">Billing Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-bold mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-sm font-bold mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-bold mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold uppercase mb-6">Shipping Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-bold mb-2">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                id="address"
                type="text"
                {...register('address')}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your address"
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-bold mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                id="city"
                type="text"
                {...register('city')}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your city"
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
              )}
            </div>

            {/* ZIP Code */}
            <div>
              <label htmlFor="zipCode" className="block text-sm font-bold mb-2">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <input
                id="zipCode"
                type="text"
                {...register('zipCode')}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.zipCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your ZIP code"
              />
              {errors.zipCode && (
                <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>
              )}
            </div>

            {/* Country */}
            <div className="md:col-span-2">
              <label htmlFor="country" className="block text-sm font-bold mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                id="country"
                type="text"
                {...register('country')}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.country ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your country"
              />
              {errors.country && (
                <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-2xl font-bold uppercase mb-6">Payment Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-4">Payment Method</label>
              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-primary">
                  <input
                    type="radio"
                    value="e-money"
                    {...register('paymentMethod')}
                    className="mr-3"
                  />
                  <span>e-Money</span>
                </label>
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-primary">
                  <input
                    type="radio"
                    value="cash"
                    {...register('paymentMethod')}
                    className="mr-3"
                  />
                  <span>Cash on Delivery</span>
                </label>
              </div>
            </div>

            {paymentMethod === 'e-money' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="eMoneyNumber" className="block text-sm font-bold mb-2">
                    e-Money Number
                  </label>
                  <input
                    id="eMoneyNumber"
                    type="text"
                    {...register('eMoneyNumber')}
                    className="w-full px-4 py-3 border rounded-lg border-gray-300"
                    placeholder="238521993"
                  />
                </div>
                <div>
                  <label htmlFor="eMoneyPIN" className="block text-sm font-bold mb-2">
                    e-Money PIN
                  </label>
                  <input
                    id="eMoneyPIN"
                    type="text"
                    {...register('eMoneyPIN')}
                    className="w-full px-4 py-3 border rounded-lg border-gray-300"
                    placeholder="6891"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  The 'Cash on Delivery' option enables you to pay in cash when our delivery courier arrives at your residence. Just make sure your address is correct so that your order will not be cancelled.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-2xl font-bold uppercase mb-6">Order Summary</h2>
          
          {/* Cart Items */}
          <div className="space-y-4 mb-6">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{item.name}</h3>
                  <p className="text-gray-600 text-sm">${item.price.toLocaleString()}</p>
                </div>
                <span className="text-gray-600 text-sm">x{item.quantity}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold">${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-bold">${shipping}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (VAT)</span>
              <span className="font-bold">${tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t">
              <span>Total</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 uppercase tracking-wider font-bold transition-colors ${
              isSubmitting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-light'
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Continue & Pay'}
          </button>
        </div>
      </div>
    </form>
  )
}