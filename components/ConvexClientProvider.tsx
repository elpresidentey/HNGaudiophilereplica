"use client"

import { ConvexProvider, ConvexReactClient } from "convex/react"
import { useEffect, useState } from "react"

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  const [convex, setConvex] = useState<ConvexReactClient | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
    if (convexUrl) {
      setConvex(new ConvexReactClient(convexUrl))
    }
  }, [])

  // During SSR or before client hydration, render children without ConvexProvider
  if (!isClient || !convex) {
    return <>{children}</>
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}

