"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCart } from '@/context/CartContext'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

// Simplified form validation schema that works reliably
const checkoutSchema = z.object({
  // Customer Information
  name: z.string(),
  email: z.string().min(1, 'Email address is required').email('Please enter a valid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  
  // Shipping Address
  address: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  zipCode: z.string().min(1, 'ZIP/Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  
  // Payment Information
  paymentMethod: z.enum(['e-money', 'cash'], {
    required_error: 'Please select a payment method',
  }),
  
  eMoneyNumber: z.string().optional(),
  eMoneyPIN: z.string().optional(),
}).refine((data) => {
  if (data.paymentMethod === 'e-money') {
    return data.eMoneyNumber && data.eMoneyNumber.trim().length > 0
  }
  return true
}, {
  message: 'E-Money Number is required when using e-Money payment',
  path: ['eMoneyNumber'],
}).refine((data) => {
  if (data.paymentMethod === 'e-money') {
    return data.eMoneyPIN && data.eMoneyPIN.trim().length > 0
  }
  return true
}, {
  message: 'E-Money PIN is required when using e-Money payment',
  path: ['eMoneyPIN'],
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutForm() {
  const router = useRouter()
  const { cart, clearCart, totalPrice } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [announceMessage, setAnnounceMessage] = useState<string>('')
  const [isClient, setIsClient] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const firstErrorRef = useRef<HTMLInputElement>(null)
  
  // Use mutation hook for Convex
  const createOrder = useMutation(api.orders.createOrder)

  // Only render on client side to avoid SSR issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    watch,
    setFocus,
    trigger,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: false,
  })

  const paymentMethod = watch('paymentMethod')

  // Memoized cart calculations
  const cartCalculations = useMemo(() => {
    const subtotal = totalPrice
    const shipping = 50
    const tax = Math.round(subtotal * 0.2)
    const total = subtotal + shipping + tax
    
    return { subtotal, shipping, tax, total }
  }, [totalPrice])

  // Simple error handling
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setAnnounceMessage('Please check the form for errors')
      setTimeout(() => setAnnounceMessage(''), 3000)
    }
  }, [errors])

  // Form submission handler
  const onSubmit = useCallback(async (data: CheckoutFormData) => {
    if (isSubmitting) return

    // Validate cart
    if (cart.length === 0) {
      setError('Your cart is empty. Please add items before checking out.')
      setAnnounceMessage('Error: Your cart is empty. Please add items before checking out.')
      return
    }

    setError(null)
    setIsSubmitting(true)
    setAnnounceMessage('Processing your order...')

    try {
      const { subtotal, shipping, tax, total } = cartCalculations

      // Generate order ID
      const timestamp = Date.now()
      const randomPart = Math.random().toString(36).substring(2, 9).toUpperCase()
      const orderId = `ORD-${timestamp}-${randomPart}`

      // Prepare order items
      const items = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }))

      let orderSaved = false
      let emailSent = false

      // Save order to Convex
      if (createOrder) {
        try {
          await createOrder({
            customerName: data.name.trim(),
            email: data.email.toLowerCase().trim(),
            phone: data.phone.trim(),
            address: data.address.trim(),
            city: data.city.trim(),
            zipCode: data.zipCode.trim(),
            country: data.country.trim(),
            paymentMethod: data.paymentMethod,
            items,
            subtotal,
            shipping,
            tax,
            total,
            orderId,
          })
          orderSaved = true
        } catch (convexError) {
          console.error('Failed to save order to Convex:', convexError)
        }
      }

      // Send confirmation email
      try {
        const emailResponse = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.email.toLowerCase().trim(),
            name: data.name.trim(),
            orderId,
            items,
            total,
            shipping,
            subtotal,
            tax,
            address: data.address.trim(),
            city: data.city.trim(),
            country: data.country.trim(),
            zipCode: data.zipCode.trim(),
          }),
        })

        if (emailResponse.ok) {
          emailSent = true
        }
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
      }

      // Store order data for confirmation page
      const orderData = {
        orderId,
        items,
        subtotal,
        shipping,
        tax,
        total,
        customerName: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        country: data.country.trim(),
        zipCode: data.zipCode.trim(),
        paymentMethod: data.paymentMethod,
        orderSaved,
        emailSent,
        timestamp: Date.now(),
      }

      try {
        sessionStorage.setItem(`order-${orderId}`, JSON.stringify(orderData))
      } catch (storageError) {
        console.error('Failed to save order to session storage:', storageError)
      }

      // Clear cart and redirect
      clearCart()
      setAnnounceMessage('Order completed successfully! Redirecting...')
      
      setTimeout(() => {
        router.push(`/checkout/confirmation?orderId=${orderId}`)
      }, 500)

    } catch (err: any) {
      console.error('Order submission failed:', err)
      
      let errorMessage = 'An unexpected error occurred. Please try again.'
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Network connection error. Please check your internet connection and try again.'
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.'
      }
      
      setError(errorMessage)
      setAnnounceMessage(`Error: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, cart, cartCalculations, createOrder, clearCart, router])

  // Loading state during SSR/hydration
  if (!isClient) {
    return (
      <div className="text-center py-12" role="status" aria-label="Loading checkout form">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
        </div>
        <p className="sr-only">Loading checkout form, please wait...</p>
      </div>
    )
  }

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="text-center py-12" role="main" aria-labelledby="empty-cart-heading">
        <div className="max-w-md mx-auto">
          <h2 id="empty-cart-heading" className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            You need to add some items to your cart before you can checkout.
          </p>
          <a 
            href="/" 
            className="inline-block bg-primary text-white px-8 py-4 uppercase tracking-wider font-bold hover:bg-primary-light transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    )
  }

  const { subtotal, shipping, tax, total } = cartCalculations

  return (
    <>
      {/* Screen reader announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        role="status"
      >
        {announceMessage}
      </div>
      
      <div 
        aria-live="assertive" 
        aria-atomic="true" 
        className="sr-only"
        role="alert"
      >
        {error && `Critical error: ${error}`}
      </div>
      
      <form 
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)} 
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        noValidate
        aria-label="Checkout form"
        role="main"
      >
        {/* Form validation summary */}
        {Object.keys(errors).length > 0 && (
          <div className="lg:col-span-3 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
              <h3 className="text-red-800 font-bold text-sm mb-2">
                Please correct the highlighted fields below
              </h3>
            </div>
          </div>
        )}
        
        <div className="lg:col-span-2">
          {/* Billing Details */}
          <fieldset className="bg-white rounded-lg p-6 md:p-8 mb-6">
            <legend className="text-2xl font-bold uppercase mb-6">Billing Details</legend>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-bold mb-2">
                  Email Address <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                    errors.email 
                      ? 'border-red-500 bg-red-50' 
                      : touchedFields.email && !errors.email
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={`email-help ${errors.email ? 'email-error' : ''}`}
                  aria-required="true"
                  placeholder="Enter your email address"
                  autoComplete="email"
                />
                <div id="email-help" className="text-xs text-gray-600 mt-1">
                  We'll send your order confirmation here
                </div>
                {errors.email && (
                  <p id="email-error" className="text-red-500 text-sm mt-1" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-bold mb-2">
                  Phone Number <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                    errors.phone 
                      ? 'border-red-500 bg-red-50' 
                      : touchedFields.phone && !errors.phone
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                  aria-invalid={errors.phone ? 'true' : 'false'}
                  aria-describedby={`phone-help ${errors.phone ? 'phone-error' : ''}`}
                  aria-required="true"
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                />
                <div id="phone-help" className="text-xs text-gray-600 mt-1">
                  For delivery coordination
                </div>
                {errors.phone && (
                  <p id="phone-error" className="text-red-500 text-sm mt-1" role="alert">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Shipping Info */}
          <fieldset className="bg-white rounded-lg p-6 md:p-8 mb-6">
            <legend className="text-2xl font-bold uppercase mb-6">Shipping Information</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Address */}
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-bold mb-2">
                  Street Address <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  id="address"
                  type="text"
                  {...register('address')}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                    errors.address 
                      ? 'border-red-500 bg-red-50' 
                      : touchedFields.address && !errors.address
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                  aria-invalid={errors.address ? 'true' : 'false'}
                  aria-describedby={`address-help ${errors.address ? 'address-error' : ''}`}
                  aria-required="true"
                  placeholder="Enter your street address"
                  autoComplete="street-address"
                />
                <div id="address-help" className="text-xs text-gray-600 mt-1">
                  Include apartment, suite, or unit number if applicable
                </div>
                {errors.address && (
                  <p id="address-error" className="text-red-500 text-sm mt-1" role="alert">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-bold mb-2">
                  City <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  id="city"
                  type="text"
                  {...register('city')}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                    errors.city 
                      ? 'border-red-500 bg-red-50' 
                      : touchedFields.city && !errors.city
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                  aria-invalid={errors.city ? 'true' : 'false'}
                  aria-describedby={`city-help ${errors.city ? 'city-error' : ''}`}
                  aria-required="true"
                  placeholder="Enter your city"
                  autoComplete="address-level2"
                />
                <div id="city-help" className="text-xs text-gray-600 mt-1">
                  City or town name
                </div>
                {errors.city && (
                  <p id="city-error" className="text-red-500 text-sm mt-1" role="alert">
                    {errors.city.message}
                  </p>
                )}
              </div>

              {/* ZIP Code */}
              <div>
                <label htmlFor="zipCode" className="block text-sm font-bold mb-2">
                  ZIP/Postal Code <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  id="zipCode"
                  type="text"
                  {...register('zipCode')}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                    errors.zipCode 
                      ? 'border-red-500 bg-red-50' 
                      : touchedFields.zipCode && !errors.zipCode
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                  aria-invalid={errors.zipCode ? 'true' : 'false'}
                  aria-describedby={`zipCode-help ${errors.zipCode ? 'zipCode-error' : ''}`}
                  aria-required="true"
                  placeholder="Enter ZIP or postal code"
                  autoComplete="postal-code"
                />
                <div id="zipCode-help" className="text-xs text-gray-600 mt-1">
                  ZIP or postal code
                </div>
                {errors.zipCode && (
                  <p id="zipCode-error" className="text-red-500 text-sm mt-1" role="alert">
                    {errors.zipCode.message}
                  </p>
                )}
              </div>

              {/* Country */}
              <div className="md:col-span-2">
                <label htmlFor="country" className="block text-sm font-bold mb-2">
                  Country <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  id="country"
                  type="text"
                  {...register('country')}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                    errors.country 
                      ? 'border-red-500 bg-red-50' 
                      : touchedFields.country && !errors.country
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                  aria-invalid={errors.country ? 'true' : 'false'}
                  aria-describedby={`country-help ${errors.country ? 'country-error' : ''}`}
                  aria-required="true"
                  placeholder="Enter your country"
                  autoComplete="country-name"
                />
                <div id="country-help" className="text-xs text-gray-600 mt-1">
                  Country name
                </div>
                {errors.country && (
                  <p id="country-error" className="text-red-500 text-sm mt-1" role="alert">
                    {errors.country.message}
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Payment Details */}
          <fieldset className="bg-white rounded-lg p-6 md:p-8">
            <legend className="text-2xl font-bold uppercase mb-6">Payment Details</legend>
            <div className="space-y-6">
              <div>
                <fieldset>
                  <legend className="block text-sm font-bold mb-4">Payment Method</legend>
                  <div className="space-y-3">
                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'e-money' ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        value="e-money"
                        {...register('paymentMethod')}
                        className="mr-3 text-primary focus:ring-primary"
                        aria-describedby="emoney-help"
                      />
                      <span className="font-medium">e-Money</span>
                    </label>
                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        value="cash"
                        {...register('paymentMethod')}
                        className="mr-3 text-primary focus:ring-primary"
                        aria-describedby="cash-help"
                      />
                      <span className="font-medium">Cash on Delivery</span>
                    </label>
                  </div>
                </fieldset>
              </div>

              {paymentMethod === 'e-money' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="eMoneyNumber" className="block text-sm font-bold mb-2">
                      e-Money Number <span className="text-red-500" aria-label="required">*</span>
                    </label>
                    <input
                      id="eMoneyNumber"
                      type="text"
                      {...register('eMoneyNumber')}
                      className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                        errors.eMoneyNumber 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      } focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                      aria-invalid={errors.eMoneyNumber ? 'true' : 'false'}
                      aria-describedby={errors.eMoneyNumber ? 'emoney-number-error' : 'emoney-help'}
                      aria-required="true"
                      placeholder="238521993"
                    />
                    {errors.eMoneyNumber && (
                      <p id="emoney-number-error" className="text-red-500 text-sm mt-1" role="alert">
                        {errors.eMoneyNumber.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="eMoneyPIN" className="block text-sm font-bold mb-2">
                      e-Money PIN <span className="text-red-500" aria-label="required">*</span>
                    </label>
                    <input
                      id="eMoneyPIN"
                      type="text"
                      {...register('eMoneyPIN')}
                      className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                        errors.eMoneyPIN 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      } focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                      aria-invalid={errors.eMoneyPIN ? 'true' : 'false'}
                      aria-describedby={errors.eMoneyPIN ? 'emoney-pin-error' : 'emoney-help'}
                      aria-required="true"
                      placeholder="6891"
                      maxLength={4}
                    />
                    {errors.eMoneyPIN && (
                      <p id="emoney-pin-error" className="text-red-500 text-sm mt-1" role="alert">
                        {errors.eMoneyPIN.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Cash on Delivery</h4>
                      <p className="text-sm text-gray-600" id="cash-help">
                        The 'Cash on Delivery' option enables you to pay in cash when our delivery courier arrives at your residence. Just make sure your address is correct so that your order will not be cancelled.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div id="emoney-help" className="sr-only">
                e-Money payment allows you to pay securely with your electronic money account
              </div>
            </div>
          </fieldset>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-6 md:p-8" role="complementary" aria-labelledby="order-summary-heading">
            <h2 id="order-summary-heading" className="text-2xl font-bold uppercase mb-6">Order Summary</h2>
            
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
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
                    <h3 className="font-bold text-sm truncate">{item.name}</h3>
                    <p className="text-gray-600 text-sm">${item.price.toLocaleString()}</p>
                  </div>
                  <span className="text-gray-600 text-sm font-medium">x{item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-bold">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-bold">${shipping}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (VAT)</span>
                <span className="font-bold">${tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t">
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 uppercase tracking-wider font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                isSubmitting 
                  ? 'bg-primary/80 text-white cursor-wait' 
                  : 'bg-primary text-white hover:bg-primary-light cursor-pointer'
              }`}
              aria-describedby="submit-help"
            >
              {isSubmitting ? 'Processing Order...' : 'Continue & Pay'}
            </button>
            <div id="submit-help" className="text-xs text-gray-600 mt-2 text-center">
              Complete your order securely
            </div>
          </div>
        </div>
      </form>
    </>
  )
}