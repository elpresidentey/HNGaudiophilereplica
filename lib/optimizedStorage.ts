/**
 * Optimized storage management for checkout flow
 * Provides high-performance storage operations with caching, compression, and cleanup
 */

interface StorageItem<T = any> {
  data: T
  timestamp: number
  version: string
  compressed?: boolean
  checksum?: string
}

interface StorageMetrics {
  reads: number
  writes: number
  hits: number
  misses: number
  errors: number
  totalSize: number
  avgReadTime: number
  avgWriteTime: number
}

export class OptimizedStorageManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private metrics: StorageMetrics = {
    reads: 0,
    writes: 0,
    hits: 0,
    misses: 0,
    errors: 0,
    totalSize: 0,
    avgReadTime: 0,
    avgWriteTime: 0
  }
  private readonly maxCacheSize = 100
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutes
  private readonly compressionThreshold = 1024 // 1KB

  /**
   * Set item with optimized caching and optional compression
   */
  async setItem<T>(key: string, value: T, options: {
    ttl?: number
    compress?: boolean
    skipCache?: boolean
  } = {}): Promise<boolean> {
    const startTime = performance.now()
    
    try {
      const { ttl = this.defaultTTL, compress = false, skipCache = false } = options
      
      // Create storage item with metadata
      const item: StorageItem<T> = {
        data: value,
        timestamp: Date.now(),
        version: '1.0'
      }

      // Serialize data
      let serialized = JSON.stringify(item)
      
      // Apply compression if enabled and data is large enough
      if (compress && serialized.length > this.compressionThreshold) {
        try {
          // Simple compression using built-in compression (if available)
          if (typeof CompressionStream !== 'undefined') {
            const compressed = await this.compressString(serialized)
            if (compressed.length < serialized.length * 0.8) { // Only use if 20% smaller
              serialized = compressed
              item.compressed = true
            }
          }
        } catch (compressionError) {
          console.warn('Compression failed, using uncompressed data:', compressionError)
        }
      }

      // Add checksum for integrity
      item.checksum = await this.generateChecksum(serialized)
      
      // Store in session storage
      sessionStorage.setItem(key, JSON.stringify(item))
      
      // Update cache if not skipped
      if (!skipCache) {
        this.updateCache(key, value, ttl)
      }
      
      // Update metrics
      const duration = performance.now() - startTime
      this.updateWriteMetrics(duration, serialized.length)
      
      return true
    } catch (error) {
      console.error('Storage write failed:', error)
      this.metrics.errors++
      return false
    }
  }

  /**
   * Get item with caching and decompression
   */
  async getItem<T>(key: string, options: {
    skipCache?: boolean
    validateChecksum?: boolean
  } = {}): Promise<T | null> {
    const startTime = performance.now()
    
    try {
      const { skipCache = false, validateChecksum = true } = options
      
      // Check cache first
      if (!skipCache) {
        const cached = this.getFromCache<T>(key)
        if (cached !== null) {
          this.metrics.hits++
          const duration = performance.now() - startTime
          this.updateReadMetrics(duration)
          return cached
        }
      }
      
      this.metrics.misses++
      
      // Get from session storage
      const stored = sessionStorage.getItem(key)
      if (!stored) {
        const duration = performance.now() - startTime
        this.updateReadMetrics(duration)
        return null
      }
      
      // Parse storage item
      const item: StorageItem<T> = JSON.parse(stored)
      
      // Validate checksum if requested
      if (validateChecksum && item.checksum) {
        const currentChecksum = await this.generateChecksum(stored)
        if (currentChecksum !== item.checksum) {
          console.warn('Storage integrity check failed for key:', key)
          this.metrics.errors++
          return null
        }
      }
      
      // Decompress if needed
      let data: T = item.data
      if (item.compressed) {
        try {
          const decompressed = await this.decompressString(JSON.stringify(item.data))
          const parsed = JSON.parse(decompressed)
          data = parsed.data as T
        } catch (decompressionError) {
          console.error('Decompression failed:', decompressionError)
          this.metrics.errors++
          return null
        }
      }
      
      // Update cache
      if (!skipCache) {
        this.updateCache(key, data, this.defaultTTL)
      }
      
      const duration = performance.now() - startTime
      this.updateReadMetrics(duration)
      
      return data
    } catch (error) {
      console.error('Storage read failed:', error)
      this.metrics.errors++
      const duration = performance.now() - startTime
      this.updateReadMetrics(duration)
      return null
    }
  }

  /**
   * Remove item from storage and cache
   */
  removeItem(key: string): boolean {
    try {
      sessionStorage.removeItem(key)
      this.cache.delete(key)
      return true
    } catch (error) {
      console.error('Storage remove failed:', error)
      this.metrics.errors++
      return false
    }
  }

  /**
   * Cleanup old and expired data
   */
  cleanup(options: {
    maxAge?: number
    maxItems?: number
    pattern?: RegExp
  } = {}): { removed: number; sizeSaved: number } {
    const { maxAge = 24 * 60 * 60 * 1000, maxItems = 50, pattern } = options
    const cutoffTime = Date.now() - maxAge
    
    let removed = 0
    let sizeSaved = 0
    
    try {
      const keys = Object.keys(sessionStorage)
      const relevantKeys = pattern ? keys.filter(key => pattern.test(key)) : keys
      
      // Sort by timestamp (oldest first)
      const keyData: { key: string; timestamp: number; size: number }[] = []
      
      relevantKeys.forEach(key => {
        try {
          const item = sessionStorage.getItem(key)
          if (item) {
            const parsed: StorageItem = JSON.parse(item)
            keyData.push({
              key,
              timestamp: parsed.timestamp || 0,
              size: item.length
            })
          }
        } catch (error) {
          // Invalid item, mark for removal
          keyData.push({ key, timestamp: 0, size: 0 })
        }
      })
      
      keyData.sort((a, b) => a.timestamp - b.timestamp)
      
      // Remove old items
      keyData.forEach(({ key, timestamp, size }) => {
        if (timestamp < cutoffTime || removed >= maxItems) {
          sessionStorage.removeItem(key)
          this.cache.delete(key)
          removed++
          sizeSaved += size
        }
      })
      
      // Clean up cache
      this.cleanupCache()
      
    } catch (error) {
      console.error('Storage cleanup failed:', error)
      this.metrics.errors++
    }
    
    return { removed, sizeSaved }
  }

  /**
   * Get storage metrics and performance data
   */
  getMetrics(): StorageMetrics & {
    cacheSize: number
    hitRate: number
    errorRate: number
    storageUsage: { used: number; available: number; percentage: number }
  } {
    const totalOperations = this.metrics.reads + this.metrics.writes
    const hitRate = this.metrics.reads > 0 ? (this.metrics.hits / this.metrics.reads) * 100 : 0
    const errorRate = totalOperations > 0 ? (this.metrics.errors / totalOperations) * 100 : 0
    
    // Estimate storage usage
    const storageUsage = this.getStorageUsage()
    
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      hitRate,
      errorRate,
      storageUsage
    }
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = {
      reads: 0,
      writes: 0,
      hits: 0,
      misses: 0,
      errors: 0,
      totalSize: 0,
      avgReadTime: 0,
      avgWriteTime: 0
    }
  }

  /**
   * Prefetch commonly used items into cache
   */
  async prefetch(keys: string[]): Promise<void> {
    const promises = keys.map(key => this.getItem(key, { skipCache: false }))
    await Promise.allSettled(promises)
  }

  /**
   * Batch operations for better performance
   */
  async batchSet<T>(items: Array<{ key: string; value: T; options?: any }>): Promise<boolean[]> {
    const promises = items.map(({ key, value, options }) => 
      this.setItem(key, value, options)
    )
    return Promise.all(promises)
  }

  async batchGet<T>(keys: string[], options?: any): Promise<Array<T | null>> {
    const promises = keys.map(key => this.getItem<T>(key, options))
    return Promise.all(promises)
  }

  // Private helper methods

  private updateCache<T>(key: string, value: T, ttl: number): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }
    
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl
    })
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  private cleanupCache(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  private updateReadMetrics(duration: number): void {
    this.metrics.reads++
    this.metrics.avgReadTime = (this.metrics.avgReadTime * (this.metrics.reads - 1) + duration) / this.metrics.reads
  }

  private updateWriteMetrics(duration: number, size: number): void {
    this.metrics.writes++
    this.metrics.totalSize += size
    this.metrics.avgWriteTime = (this.metrics.avgWriteTime * (this.metrics.writes - 1) + duration) / this.metrics.writes
  }

  private async generateChecksum(data: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      try {
        const encoder = new TextEncoder()
        const dataBuffer = encoder.encode(data)
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 8)
      } catch (error) {
        // Fallback to simple hash
        return this.simpleHash(data)
      }
    }
    return this.simpleHash(data)
  }

  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).slice(0, 8)
  }

  private async compressString(str: string): Promise<string> {
    // Simple compression using built-in APIs if available
    if (typeof CompressionStream !== 'undefined') {
      const stream = new CompressionStream('gzip')
      const writer = stream.writable.getWriter()
      const reader = stream.readable.getReader()
      
      writer.write(new TextEncoder().encode(str))
      writer.close()
      
      const chunks: Uint8Array[] = []
      let done = false
      
      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) chunks.push(value)
      }
      
      const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
      let offset = 0
      for (const chunk of chunks) {
        compressed.set(chunk, offset)
        offset += chunk.length
      }
      
      return btoa(String.fromCharCode(...compressed))
    }
    
    return str // Fallback to uncompressed
  }

  private async decompressString(str: string): Promise<string> {
    // Simple decompression using built-in APIs if available
    if (typeof DecompressionStream !== 'undefined') {
      try {
        const compressed = Uint8Array.from(atob(str), c => c.charCodeAt(0))
        const stream = new DecompressionStream('gzip')
        const writer = stream.writable.getWriter()
        const reader = stream.readable.getReader()
        
        writer.write(compressed)
        writer.close()
        
        const chunks: Uint8Array[] = []
        let done = false
        
        while (!done) {
          const { value, done: readerDone } = await reader.read()
          done = readerDone
          if (value) chunks.push(value)
        }
        
        const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
        let offset = 0
        for (const chunk of chunks) {
          decompressed.set(chunk, offset)
          offset += chunk.length
        }
        
        return new TextDecoder().decode(decompressed)
      } catch (error) {
        console.warn('Decompression failed, returning original:', error)
        return str
      }
    }
    
    return str // Fallback to original
  }

  private getStorageUsage(): { used: number; available: number; percentage: number } {
    try {
      let used = 0
      for (let key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key)) {
          used += sessionStorage[key].length + key.length
        }
      }
      
      // Estimate 5MB limit for session storage
      const limit = 5 * 1024 * 1024
      const available = limit - used
      const percentage = (used / limit) * 100
      
      return { used, available, percentage }
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 }
    }
  }
}

// Global optimized storage instance
export const optimizedStorage = new OptimizedStorageManager()

// Convenience functions for common operations
export const setOrderData = (orderId: string, data: any) => 
  optimizedStorage.setItem(`order-${orderId}`, data, { compress: true })

export const getOrderData = (orderId: string) => 
  optimizedStorage.getItem(`order-${orderId}`)

export const cleanupOldOrders = () => 
  optimizedStorage.cleanup({ 
    pattern: /^order-/, 
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxItems: 10 
  })