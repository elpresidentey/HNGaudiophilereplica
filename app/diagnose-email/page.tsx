"use client"

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function DiagnoseEmailPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [testEmail, setTestEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    try {
      const response = await fetch('/api/diagnose-email')
      const data = await response.json()
      setDiagnostics(data)
    } catch (error) {
      console.error('Failed to run diagnostics:', error)
    }
  }

  const runEmailTest = async () => {
    if (!testEmail) {
      alert('Please enter an email address')
      return
    }

    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/diagnose-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail })
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message,
        steps: []
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main>
      <Header />
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">🔍 Email System Diagnostics</h1>
          
          {/* Current Status */}
          {diagnostics && (
            <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
              <h2 className="text-xl font-bold mb-4">Current Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold mb-2">API Key Status</h3>
                  <div className="space-y-2">
                    <div className={`flex items-center gap-2 ${diagnostics.checks.resendApiKey.exists ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{diagnostics.checks.resendApiKey.exists ? '✅' : '❌'}</span>
                      <span>API Key {diagnostics.checks.resendApiKey.exists ? 'Found' : 'Missing'}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${diagnostics.checks.resendApiKey.format === 'valid' ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{diagnostics.checks.resendApiKey.format === 'valid' ? '✅' : '❌'}</span>
                      <span>Format: {diagnostics.checks.resendApiKey.format}</span>
                    </div>
                    {diagnostics.checks.resendApiKey.exists && (
                      <div className="text-sm text-gray-600">
                        Length: {diagnostics.checks.resendApiKey.length} characters
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-2">Environment</h3>
                  <div className="space-y-1 text-sm">
                    <div>Environment: {diagnostics.checks.environmentVariables.NODE_ENV}</div>
                    <div>Vercel: {diagnostics.checks.environmentVariables.VERCEL}</div>
                    <div>Timestamp: {new Date(diagnostics.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Issues Found */}
              {diagnostics.nextSteps.length > 0 && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-bold text-yellow-800 mb-2">⚠️ Issues Found</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                    {diagnostics.nextSteps.map((step: string, index: number) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Email Test */}
          <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
            <h2 className="text-xl font-bold mb-4">Test Email Sending</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  Test Email Address
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="Enter email to test"
                />
              </div>

              <button
                onClick={runEmailTest}
                disabled={isLoading}
                className={`px-6 py-3 rounded-lg font-bold ${
                  isLoading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-light'
                }`}
              >
                {isLoading ? 'Testing...' : 'Run Email Test'}
              </button>
            </div>

            {/* Test Results */}
            {testResult && (
              <div className="mt-6">
                <h3 className="font-bold mb-3">Test Results</h3>
                
                <div className={`p-4 rounded-lg mb-4 ${
                  testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className={`font-bold ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {testResult.success ? '✅ Email Test Successful!' : '❌ Email Test Failed'}
                  </div>
                  {testResult.emailId && (
                    <div className="text-sm text-green-700 mt-1">
                      Email ID: {testResult.emailId}
                    </div>
                  )}
                  {testResult.error && (
                    <div className="text-sm text-red-700 mt-1">
                      Error: {testResult.error}
                    </div>
                  )}
                </div>

                {/* Step by step results */}
                {testResult.steps && testResult.steps.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold">Detailed Steps:</h4>
                    {testResult.steps.map((step: any, index: number) => (
                      <div key={index} className={`flex items-center gap-3 p-2 rounded ${
                        step.success ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                        <span>{step.success ? '✅' : '❌'}</span>
                        <div className="flex-1">
                          <div className="font-medium">{step.name}</div>
                          <div className="text-sm text-gray-600">{step.details}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Common Solutions */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-bold mb-4">🔧 Common Solutions</h2>
            
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold text-red-600 mb-2">❌ Missing API Key</h3>
                <p className="text-sm mb-2">If you see "API Key Missing":</p>
                <ol className="list-decimal list-inside text-sm space-y-1">
                  <li>Go to <a href="https://resend.com" className="text-primary hover:underline">resend.com</a> and sign up</li>
                  <li>Create an API key (starts with "re_")</li>
                  <li>Add to Vercel: Settings → Environment Variables</li>
                  <li>Variable name: <code className="bg-gray-100 px-1">RESEND_API_KEY</code></li>
                  <li>Redeploy your site</li>
                </ol>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-bold text-yellow-600 mb-2">⚠️ Invalid Format</h3>
                <p className="text-sm mb-2">If you see "Invalid Format":</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>API key must start with "re_"</li>
                  <li>Get a new key from resend.com if needed</li>
                  <li>Make sure no extra spaces or characters</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-bold text-blue-600 mb-2">🔄 Still Not Working?</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Check Vercel function logs for detailed errors</li>
                  <li>Verify the environment variable is set for "Production"</li>
                  <li>Try redeploying after adding the API key</li>
                  <li>Test with a different email address</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}