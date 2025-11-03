"use client"

import { Suspense, useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// Simple loading component
function CheckoutLoading() {
  return (
    <div className="text-center py-12">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-64 mx-auto mb-6"></div>
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
          <span className="text-gray-600">Loading checkout...</span>
        </div>
      </div>
    </div>
  )
}

// Lazy load the checkout form to avoid initial loading issues
function CheckoutFormWrapper() {
  const [isClient, setIsClient] = useState(false)
  const [SimpleCheckoutForm, setSimpleCheckoutForm] = useState<any>(null)

  useEffect(() => {
    setIsClient(true)
    // Dynamically import the form component
    import('@/components/SimpleCheckoutForm').then((module) => {
      setSimpleCheckoutForm(() => module.default)
    }).catch((error) => {
      console.error('Failed to load checkout form:', error)
    })
  }, [])

  if (!isClient) {
    return <CheckoutLoading />
  }

  if (!SimpleCheckoutForm) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <h2 className="text-xl font-bold mb-4">Loading Checkout Form...</h2>
        <p className="text-gray-600">Please wait while we load the checkout form.</p>
      </div>
    )
  }

  return <SimpleCheckoutForm />
}

export default function CheckoutPage() {
  return (
    <main>
      <Header />
      <div className="container mx-auto px-6 py-8">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Go Back
        </button>
      </div>
      <section className="container mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold uppercase mb-8">Checkout</h1>
        <Suspense fallback={<CheckoutLoading />}>
          <CheckoutFormWrapper />
        </Suspense>
      </section>
      <Footer />
    </main>
  )
}


