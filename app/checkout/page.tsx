"use client"

import { Suspense, useEffect } from 'react'
import dynamicImport from 'next/dynamic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import GoBack from '@/components/GoBack'
import PerformanceSummary from '@/components/PerformanceSummary'
import { checkoutPerformanceMonitor } from '@/lib/performanceMonitor'

// Dynamically import CheckoutForm to avoid SSR issues with ConvexProvider
const CheckoutForm = dynamicImport(() => {
  checkoutPerformanceMonitor.start('checkout_form_load')
  return import('@/components/CheckoutForm').then(module => {
    checkoutPerformanceMonitor.end('checkout_form_load')
    return module
  })
}, {
  ssr: false,
  loading: () => (
    <div className="text-center py-12" role="status" aria-label="Loading checkout form">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-64 mx-auto mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-200 rounded-lg h-64"></div>
            <div className="bg-gray-200 rounded-lg h-48"></div>
            <div className="bg-gray-200 rounded-lg h-32"></div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-gray-200 rounded-lg h-96"></div>
          </div>
        </div>
      </div>
      <div className="mt-6 text-sm text-gray-500">
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span>Loading secure checkout form...</span>
        </div>
      </div>
    </div>
  )
})

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function CheckoutPage() {
  useEffect(() => {
    // Start tracking page load performance
    checkoutPerformanceMonitor.start('checkout_page_load')
    
    return () => {
      checkoutPerformanceMonitor.end('checkout_page_load')
    }
  }, [])

  return (
    <main>
      <Header />
      <div className="container mx-auto px-6 py-8">
        <GoBack />
      </div>
      <section className="container mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold uppercase mb-8">Checkout</h1>
        <Suspense fallback={
          <div className="text-center py-12" role="status" aria-label="Loading checkout">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-64 mx-auto mb-6"></div>
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-gray-600">Preparing secure checkout...</span>
              </div>
            </div>
          </div>
        }>
          <CheckoutForm />
        </Suspense>
      </section>
      <Footer />
      <PerformanceSummary />
    </main>
  )
}


