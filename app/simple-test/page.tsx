"use client"

import { useState } from 'react'

export default function SimpleTestPage() {
  const [result, setResult] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/simple-test')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to run test' })
    }
    setLoading(false)
  }

  const sendTestEmail = async () => {
    if (!email) {
      alert('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/simple-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to send test email' })
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-8">🔧 Simple Email Test</h1>
      
      <div className="bg-white p-6 rounded-lg shadow border max-w-2xl">
        <div className="space-y-4">
          <button
            onClick={runTest}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Run Basic Test'}
          </button>

          <div className="border-t pt-4">
            <h3 className="font-bold mb-2">Send Test Email:</h3>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border rounded mb-2"
            />
            <button
              onClick={sendTestEmail}
              disabled={loading || !email}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading ? 'Sending...' : 'Send Test Email'}
            </button>
          </div>

          {result && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h3 className="font-bold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}