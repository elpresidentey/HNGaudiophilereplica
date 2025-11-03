"use client"

import { memo } from 'react'

interface OptimizedLoadingStateProps {
  step: 'idle' | 'validating' | 'saving' | 'emailing' | 'completing' | 'success' | 'error'
  message: string
  progress: number
  showDetails?: boolean
  emailError?: boolean
}

/**
 * Optimized loading state component with minimal re-renders
 * Uses memo to prevent unnecessary updates during form submission
 */
const OptimizedLoadingState = memo(function OptimizedLoadingState({
  step,
  message,
  progress,
  showDetails = true,
  emailError = false
}: OptimizedLoadingStateProps) {
  if (step === 'idle') return null

  const getStepIcon = () => {
    switch (step) {
      case 'validating':
        return (
          <svg className="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )
      case 'saving':
        return (
          <svg className="animate-pulse h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )
      case 'emailing':
        return (
          <svg className="animate-bounce h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        )
      case 'completing':
        return (
          <svg className="animate-spin h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )
      case 'success':
        return (
          <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'error':
        return (
          <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }

  const getProgressBarColor = () => {
    switch (step) {
      case 'success':
        return 'bg-green-600'
      case 'error':
        return 'bg-red-600'
      default:
        return 'bg-blue-600'
    }
  }

  const getBackgroundColor = () => {
    switch (step) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getTextColor = () => {
    switch (step) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      default:
        return 'text-blue-800'
    }
  }

  return (
    <div 
      className={`p-4 rounded-lg border ${getBackgroundColor()}`}
      role="status" 
      aria-labelledby="submission-progress"
      aria-live="polite"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 id="submission-progress" className={`font-bold text-sm flex items-center ${getTextColor()}`}>
          <div className="mr-2">
            {getStepIcon()}
          </div>
          {step === 'success' ? 'Order Completed!' : 
           step === 'error' ? 'Processing Error' : 
           'Processing Your Order'}
        </h3>
        {showDetails && step !== 'error' && step !== 'success' && (
          <span className="text-blue-600 text-sm font-bold">{progress}%</span>
        )}
      </div>

      {showDetails && step !== 'error' && step !== 'success' && (
        <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ease-out ${getProgressBarColor()}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}

      <p className={`text-sm ${step === 'success' ? 'text-green-700' : step === 'error' ? 'text-red-700' : 'text-blue-700'}`}>
        {message}
      </p>

      {step === 'emailing' && emailError && (
        <p className="text-yellow-600 text-xs mt-1 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Email delivery may be delayed, but your order is being processed.
        </p>
      )}

      {step === 'success' && (
        <div className="mt-2 text-xs text-green-600">
          <p>✓ Order saved successfully</p>
          <p>✓ Confirmation email sent</p>
          <p>✓ Redirecting to confirmation page...</p>
        </div>
      )}
    </div>
  )
})

export default OptimizedLoadingState