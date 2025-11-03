"use client"

import { useRouter } from 'next/navigation'

interface GoBackProps {
  className?: string
}

export default function GoBack({ className = "" }: GoBackProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className={`text-dark/60 hover:text-primary transition-colors inline-flex items-center gap-2 ${className}`}
    >
      <span>&larr;</span>
      <span>Go Back</span>
    </button>
  )
}