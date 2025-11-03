import React from 'react'

interface SimpleFormFieldProps {
  id: string
  label: string
  type?: string
  required?: boolean
  error?: string
  className?: string
  register: any
  placeholder?: string
}

export default function SimpleFormField({
  id,
  label,
  type = 'text',
  required = false,
  error,
  className = '',
  register,
  placeholder
}: SimpleFormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-bold mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...register}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}