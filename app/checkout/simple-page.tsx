"use client"

import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function SimpleCheckoutPage() {
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
        <div className="bg-white rounded-lg p-8">
          <h2 className="text-xl font-bold mb-4">Simple Checkout Form</h2>
          <p className="text-gray-600 mb-6">
            This is a simplified checkout page for testing. The full checkout functionality 
            will be restored once we identify the loading issue.
          </p>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-2">Email</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Enter your email"
              />
            </div>
            
            <button 
              type="button"
              className="bg-primary text-white px-8 py-4 uppercase tracking-wider font-bold hover:bg-primary-light"
              onClick={() => alert('This is a test checkout form')}
            >
              Test Checkout
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </main>
  )
}