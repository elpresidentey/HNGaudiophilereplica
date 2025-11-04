"use client"

import { useState, useEffect } from 'react'

export default function EmailStatusBanner() {
  const [emailStatus, setEmailStatus] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    checkEmailStatus()
  }, [])

  const checkEmailStatus = async () => {
    try {
      const response = await fetch('/api/email-status')
      const status = await response.json()
      setEmailStatus(status)
      
      // Show banner if email is not configured
      if (!status.configured) {
        setIsVisible(true)
      }
    } catch (error) {
      console.error('Failed to check email status:', error)
    }
  }

  if (!isVisible || !emailStatus || emailStatus.configured) {
    return null
  }

  return (
    <div className="bg-red-600 text-white px-4 py-3 relative">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <span className="font-bold">🚨 CRITICAL: Email System Not Configured</span>
            <span className="ml-2 text-sm">Customer notifications will fail!</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a 
            href="/test-email" 
            className="bg-white text-red-600 px-3 py-1 rounded text-sm font-bold hover:bg-gray-100"
          >
            Setup Email
          </a>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}