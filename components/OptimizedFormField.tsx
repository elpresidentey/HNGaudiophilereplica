"use client"

import { memo, useCallback, useMemo } from 'react'
import { FieldError, UseFormRegisterReturn } from 'react-hook-form'

interface OptimizedFormFieldProps {
  id: string
  label: string
  type?: string
  placeholder?: string
  autoComplete?: string
  required?: boolean
  register: UseFormRegisterReturn
  error?: FieldError
  helpText?: string
  validationState?: 'idle' | 'validating' | 'valid' | 'invalid'
  isDirty?: boolean
  onValidation?: (fieldName: string, value: string) => void
  onBlur?: (fieldName: string) => void
  className?: string
}

/**
 * Optimized form field component with minimal re-renders
 * Uses memo and optimized event handlers to prevent unnecessary updates
 */
const OptimizedFormField = memo(function OptimizedFormField({
  id,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  required = false,
  register,
  error,
  helpText,
  validationState = 'idle',
  isDirty = false,
  onValidation,
  onBlur,
  className = ''
}: OptimizedFormFieldProps) {
  
  // Memoized input class calculation to prevent recalculation on every render
  const inputClassName = useMemo(() => {
    const baseClasses = 'w-full px-4 py-3 pr-12 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
    
    if (error) {
      return `${baseClasses} border-red-500 bg-red-50 shadow-sm shadow-red-100 ring-1 ring-red-200`
    } else if (validationState === 'valid') {
      return `${baseClasses} border-green-500 bg-green-50 shadow-sm shadow-green-100 ring-1 ring-green-200`
    } else if (validationState === 'validating') {
      return `${baseClasses} border-blue-400 bg-blue-50 shadow-sm shadow-blue-100 ring-1 ring-blue-200`
    } else if (isDirty) {
      return `${baseClasses} border-blue-300 bg-blue-50`
    } else {
      return `${baseClasses} border-gray-300 hover:border-gray-400`
    }
  }, [error, validationState, isDirty])

  // Memoized validation icon to prevent unnecessary re-renders
  const validationIcon = useMemo(() => {
    if (error) {
      return (
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    } else if (validationState === 'valid') {
      return (
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    } else if (validationState === 'validating') {
      return (
        <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )
    } else if (isDirty) {
      return (
        <svg className="w-5 h-5 text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
    return null
  }, [error, validationState, isDirty])

  // Optimized change handler with debouncing
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    register.onChange(e)
    if (onValidation) {
      onValidation(id, e.target.value)
    }
  }, [register, onValidation, id])

  // Optimized blur handler
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    register.onBlur(e)
    if (onBlur) {
      onBlur(id)
    }
  }, [register, onBlur, id])

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-bold mb-2">
        {label} {required && <span className="text-red-500" aria-label="required">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          name={register.name}
          ref={register.ref}
          type={type}
          className={inputClassName}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${id}-help ${error ? `${id}-error` : ''}`}
          aria-required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        
        {/* Validation status icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {validationIcon}
        </div>
      </div>
      
      {helpText && (
        <div id={`${id}-help`} className="text-xs text-gray-600 mt-1">
          {helpText}
        </div>
      )}
      
      {error && (
        <p id={`${id}-error`} className="text-red-500 text-sm mt-1 flex items-center animate-fadeIn" role="alert">
          <span className="mr-1" aria-hidden="true">⚠</span>
          {error.message}
        </p>
      )}
    </div>
  )
})

export default OptimizedFormField