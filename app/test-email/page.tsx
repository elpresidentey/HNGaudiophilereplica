"use client"

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const testEmail = async () => {
    if (!email) {
      setMessage('Please enter an email address')
      return
    }

    setStatus('sending')
    setMessage('Sending test email...')

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: 'Test User',
          orderId: 'TEST-' + Date.now(),
          items: [
            {
              id: 1,
              name: 'Test Product',
              price: 100,
              quantity: 1,
              image: '/assets/product-xx99-mark-two-headphones/desktop/image-product.jpg'
            }
          ],
          total: 150,
          shipping: 50,
          subtotal: 100,
          tax: 0,
          address: '123 Test Street',
          city: 'Test City',
          country: 'Test Country',
          zipCode: '12345',
        }),
      })

      if (response.ok) {
        setStatus('success')
        setMessage('✅ Test email sent successfully! Check your inbox.')
      } else {
        const errorData = await response.json()
        setStatus('error')
        setMessage(`❌ Email failed: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      setStatus('error')
      setMessage(`❌ Network error: ${error}`)
    }
  }

  const checkEmailStatus = async () => {
    try {
      const response = await fetch('/api/email-status')
      const data = await response.json()
      setMessage(`📧 Email service status: ${data.message}`)
    } catch (error) {
      setMessage(`❌ Could not check email status: ${error}`)
    }
  }

  return (
    <main>
      <Header />
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">📧 Email Service Test</h1>
          
          <div className="bg-white rounded-lg p-8 shadow-sm border">
            <h2 className="text-xl font-bold mb-6">Test Email Functionality</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2">
                  Test Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="Enter your email to test"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={testEmail}
                  disabled={status === 'sending'}
                  className={`px-6 py-3 rounded-lg font-bold ${
                    status === 'sending'
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary-light'
                  }`}
                >
                  {status === 'sending' ? 'Sending...' : 'Send Test Email'}
                </button>

                <button
                  onClick={checkEmailStatus}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-bold hover:bg-gray-50"
                >
                  Check Email Status
                </button>
              </div>

              {message && (
                <div className={`p-4 rounded-lg ${
                  status === 'success' ? 'bg-green-50 text-green-700' :
                  status === 'error' ? 'bg-red-50 text-red-700' :
                  'bg-blue-50 text-blue-700'
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="font-bold mb-4">🔧 Setup Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Get a free API key from <a href="https://resend.com" className="text-primary hover:underline">resend.com</a></li>
              <li>Add <code className="bg-gray-200 px-2 py-1 rounded">RESEND_API_KEY</code> to your Vercel environment variables</li>
              <li>Redeploy your site</li>
              <li>Test using this page</li>
            </ol>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Your checkout works perfectly even without email configured. 
                Users can complete orders and get confirmation pages. Email is just a nice bonus!
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}