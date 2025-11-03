/**
 * Enhanced performance monitoring utility for checkout flow
 * Provides comprehensive tracking, analysis, and optimization insights
 */

export interface PerformanceMetric {
  name: string
  duration: number
  timestamp: number
  metadata?: Record<string, any>
}

export interface PerformanceThresholds {
  form_validation: number
  submission_total: number
  email_send: number
  convex_save: number
  client_hydration: number
  form_load_total: number
  cart_calculations: number
  cart_operations: number
  session_storage: number
  validation_debounce: number
  [key: string]: number
}

export interface PerformanceInsights {
  formPerformance: {
    avgLoadTime: number
    avgValidationTime: number
    validationCacheHitRate: number
    slowValidations: string[]
  }
  cartPerformance: {
    avgCalculationTime: number
    avgOperationTime: number
    operationCount: number
    memoryUsage: number
  }
  submissionPerformance: {
    avgSubmissionTime: number
    successRate: number
    retryRate: number
    errorCategories: Record<string, number>
  }
  storagePerformance: {
    avgReadTime: number
    avgWriteTime: number
    cacheHitRate: number
    storageSize: number
  }
  criticalIssues: PerformanceMetric[]
  recommendations: string[]
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private startTimes: Map<string, number> = new Map()
  private thresholds: PerformanceThresholds = {
    form_validation: 100,
    submission_total: 5000,
    email_send: 3000,
    convex_save: 2000,
    client_hydration: 1000,
    form_load_total: 2000,
    cart_calculations: 50,
    cart_operations: 100,
    session_storage: 50,
    validation_debounce: 200
  }
  private maxMetrics: number = 1000 // Prevent memory leaks
  private performanceObserver: PerformanceObserver | null = null

  constructor() {
    this.initializePerformanceObserver()
  }

  /**
   * Initialize browser Performance Observer for enhanced monitoring
   */
  private initializePerformanceObserver(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            if (entry.entryType === 'measure' && entry.name.includes('checkout')) {
              this.record(entry.name, entry.duration, {
                type: 'browser_measure',
                startTime: entry.startTime,
                source: 'performance_observer'
              })
            }
          })
        })
        this.performanceObserver.observe({ entryTypes: ['measure', 'navigation', 'resource'] })
      } catch (error) {
        console.warn('Performance Observer initialization failed:', error)
      }
    }
  }

  /**
   * Start timing a performance metric with enhanced tracking
   */
  start(metricName: string, metadata?: Record<string, any>): void {
    const timestamp = performance.now ? performance.now() : Date.now()
    this.startTimes.set(metricName, timestamp)
    
    // Store metadata for later use
    if (metadata) {
      this.startTimes.set(`${metricName}_metadata`, metadata as any)
    }

    // Create browser performance mark if available
    if (typeof window !== 'undefined' && window.performance?.mark) {
      try {
        window.performance.mark(`${metricName}_start`)
      } catch (error) {
        // Ignore marking errors
      }
    }
  }

  /**
   * End timing a performance metric and record it with enhanced analysis
   */
  end(metricName: string, additionalMetadata?: Record<string, any>): number {
    const startTime = this.startTimes.get(metricName)
    if (!startTime) {
      console.warn(`Performance metric "${metricName}" was not started`)
      return 0
    }

    const endTime = performance.now ? performance.now() : Date.now()
    const duration = endTime - startTime
    const storedMetadata = this.startTimes.get(`${metricName}_metadata`) as Record<string, any> | undefined
    
    const metric: PerformanceMetric = {
      name: metricName,
      duration,
      timestamp: Date.now(),
      metadata: { 
        ...storedMetadata, 
        ...additionalMetadata,
        startTime,
        endTime,
        isSlowOperation: duration > (this.thresholds[metricName] || 1000)
      }
    }

    this.addMetric(metric)
    
    // Create browser performance measure if available
    if (typeof window !== 'undefined' && window.performance?.measure) {
      try {
        window.performance.measure(metricName, `${metricName}_start`)
      } catch (error) {
        // Ignore measuring errors
      }
    }
    
    // Clean up
    this.startTimes.delete(metricName)
    this.startTimes.delete(`${metricName}_metadata`)

    // Enhanced logging with performance analysis
    if (process.env.NODE_ENV === 'development') {
      const threshold = this.thresholds[metricName] || 1000
      const isSlowOperation = duration > threshold
      
      if (isSlowOperation) {
        console.warn(`🐌 Slow Performance: ${metricName} took ${duration}ms (threshold: ${threshold}ms)`, metric.metadata)
      } else {
        console.log(`⚡ Performance: ${metricName} took ${duration}ms`, metric.metadata)
      }
    }

    return duration
  }

  /**
   * Add a metric with memory management
   */
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)
    
    // Prevent memory leaks by limiting stored metrics
    if (this.metrics.length > this.maxMetrics) {
      // Remove oldest 20% of metrics
      const removeCount = Math.floor(this.maxMetrics * 0.2)
      this.metrics.splice(0, removeCount)
    }
  }

  /**
   * Record a one-time performance metric with enhanced analysis
   */
  record(metricName: string, duration: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name: metricName,
      duration,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        isSlowOperation: duration > (this.thresholds[metricName] || 1000),
        recordedDirectly: true
      }
    }

    this.addMetric(metric)

    if (process.env.NODE_ENV === 'development') {
      const threshold = this.thresholds[metricName] || 1000
      const isSlowOperation = duration > threshold
      
      if (isSlowOperation) {
        console.warn(`🐌 Slow Performance: ${metricName} recorded as ${duration}ms (threshold: ${threshold}ms)`, metadata)
      } else {
        console.log(`⚡ Performance: ${metricName} recorded as ${duration}ms`, metadata)
      }
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  /**
   * Get metrics by name pattern
   */
  getMetricsByPattern(pattern: string): PerformanceMetric[] {
    const regex = new RegExp(pattern)
    return this.metrics.filter(metric => regex.test(metric.name))
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, { count: number; avgDuration: number; totalDuration: number; maxDuration: number }> {
    const summary: Record<string, { count: number; avgDuration: number; totalDuration: number; maxDuration: number }> = {}

    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          avgDuration: 0,
          totalDuration: 0,
          maxDuration: 0
        }
      }

      const s = summary[metric.name]
      s.count++
      s.totalDuration += metric.duration
      s.maxDuration = Math.max(s.maxDuration, metric.duration)
      s.avgDuration = s.totalDuration / s.count
    })

    return summary
  }

  /**
   * Clear all metrics with cleanup
   */
  clear(): void {
    this.metrics = []
    this.startTimes.clear()
    
    // Clear browser performance marks and measures
    if (typeof window !== 'undefined' && window.performance) {
      try {
        window.performance.clearMarks()
        window.performance.clearMeasures()
      } catch (error) {
        // Ignore clearing errors
      }
    }
  }

  /**
   * Cleanup and dispose of the performance monitor
   */
  dispose(): void {
    this.clear()
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect()
      this.performanceObserver = null
    }
  }

  /**
   * Export metrics for analysis
   */
  export(): string {
    return JSON.stringify({
      metrics: this.metrics,
      summary: this.getSummary(),
      exportedAt: Date.now()
    }, null, 2)
  }

  /**
   * Update performance thresholds
   */
  setThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    Object.keys(newThresholds).forEach(key => {
      const value = newThresholds[key as keyof PerformanceThresholds]
      if (value !== undefined) {
        (this.thresholds as any)[key] = value
      }
    })
  }

  /**
   * Get current performance thresholds
   */
  getThresholds(): PerformanceThresholds {
    return { ...this.thresholds }
  }

  /**
   * Check if any metrics exceed performance thresholds with detailed analysis
   */
  getPerformanceIssues(customThresholds: Record<string, number> = {}): PerformanceMetric[] {
    const activeThresholds: Record<string, number> = { ...this.thresholds, ...customThresholds }

    return this.metrics.filter(metric => {
      const threshold = activeThresholds[metric.name] || 1000
      return metric.duration > threshold
    }).sort((a, b) => b.duration - a.duration) // Sort by severity (duration)
  }

  /**
   * Get performance bottlenecks with recommendations
   */
  getBottlenecks(): { metric: PerformanceMetric; severity: 'critical' | 'warning' | 'info'; recommendation: string }[] {
    const issues = this.getPerformanceIssues()
    
    return issues.map(metric => {
      const threshold = this.thresholds[metric.name] || 1000
      const ratio = metric.duration / threshold
      
      let severity: 'critical' | 'warning' | 'info'
      let recommendation: string
      
      if (ratio > 3) {
        severity = 'critical'
        recommendation = this.getCriticalRecommendation(metric.name)
      } else if (ratio > 2) {
        severity = 'warning'
        recommendation = this.getWarningRecommendation(metric.name)
      } else {
        severity = 'info'
        recommendation = this.getInfoRecommendation(metric.name)
      }
      
      return { metric, severity, recommendation }
    })
  }

  /**
   * Get performance recommendations based on metric patterns
   */
  private getCriticalRecommendation(metricName: string): string {
    const recommendations: Record<string, string> = {
      form_validation: 'Consider debouncing validation or using Web Workers for complex validation',
      submission_total: 'Optimize network requests, implement request batching, or add progress indicators',
      email_send: 'Implement email queue system or use faster email service provider',
      convex_save: 'Optimize database queries, add connection pooling, or implement caching',
      client_hydration: 'Reduce bundle size, implement code splitting, or optimize initial render',
      form_load_total: 'Implement lazy loading, reduce initial JavaScript bundle, or use SSR',
      cart_calculations: 'Memoize calculations, optimize algorithms, or use Web Workers',
      session_storage: 'Reduce data size, implement compression, or use IndexedDB for large data'
    }
    
    return recommendations[metricName] || 'Consider optimizing this operation or implementing caching'
  }

  private getWarningRecommendation(metricName: string): string {
    const recommendations: Record<string, string> = {
      form_validation: 'Consider increasing debounce delay or optimizing validation logic',
      submission_total: 'Add loading states and consider request optimization',
      email_send: 'Monitor email service performance and consider fallback options',
      convex_save: 'Review database query efficiency and connection handling',
      client_hydration: 'Consider reducing initial component complexity',
      form_load_total: 'Review component loading strategy and bundle optimization',
      cart_calculations: 'Consider memoization for frequently calculated values',
      session_storage: 'Monitor storage usage and consider data cleanup strategies'
    }
    
    return recommendations[metricName] || 'Monitor this operation and consider optimization if it worsens'
  }

  private getInfoRecommendation(_metricName: string): string {
    return 'Performance is acceptable but can be monitored for trends'
  }

  /**
   * Get comprehensive checkout-specific performance insights
   */
  getCheckoutInsights(): PerformanceInsights {
    const formMetrics = this.getMetricsByPattern('form_|validation_|client_hydration')
    const cartMetrics = this.getMetricsByPattern('cart_')
    const submissionMetrics = this.getMetricsByPattern('submission_|email_|convex_')
    const storageMetrics = this.getMetricsByPattern('session_storage|localStorage')
    const validationMetrics = this.getMetricsByPattern('validation_')
    
    // Form performance analysis
    const formLoadTimes = formMetrics.filter(m => m.name.includes('load'))
    const validationTimes = formMetrics.filter(m => m.name.includes('validation'))
    const cachedValidations = validationMetrics.filter(m => m.name.includes('cached'))
    const slowValidations = validationTimes.filter(m => m.duration > 200).map(m => m.name)
    
    // Cart performance analysis
    const cartCalculations = cartMetrics.filter(m => m.name === 'cart_calculations')
    const cartOperations = cartMetrics.filter(m => m.name !== 'cart_calculations')
    
    // Submission performance analysis
    const submissions = submissionMetrics.filter(m => m.name.includes('submission'))
    const successfulSubmissions = submissions.filter(m => m.name.includes('success'))
    const retrySubmissions = submissions.filter(m => m.name.includes('retry'))
    const errorSubmissions = submissionMetrics.filter(m => m.name.includes('error'))
    
    // Storage performance analysis
    const storageReads = storageMetrics.filter(m => m.name.includes('read'))
    const storageWrites = storageMetrics.filter(m => m.name.includes('write'))
    
    // Error categorization
    const errorCategories: Record<string, number> = {}
    errorSubmissions.forEach(metric => {
      const category = metric.name.split('_').pop() || 'unknown'
      errorCategories[category] = (errorCategories[category] || 0) + 1
    })
    
    // Memory usage estimation (rough calculation)
    const estimatedMemoryUsage = this.metrics.length * 200 + // Approximate bytes per metric
      (typeof window !== 'undefined' && (window.performance as any)?.memory?.usedJSHeapSize || 0)

    const insights: PerformanceInsights = {
      formPerformance: {
        avgLoadTime: this.calculateAverage(formLoadTimes),
        avgValidationTime: this.calculateAverage(validationTimes),
        validationCacheHitRate: validationTimes.length > 0 
          ? (cachedValidations.length / validationTimes.length) * 100 
          : 0,
        slowValidations: [...new Set(slowValidations)] // Remove duplicates
      },
      cartPerformance: {
        avgCalculationTime: this.calculateAverage(cartCalculations),
        avgOperationTime: this.calculateAverage(cartOperations),
        operationCount: cartOperations.length,
        memoryUsage: estimatedMemoryUsage
      },
      submissionPerformance: {
        avgSubmissionTime: this.calculateAverage(submissions),
        successRate: submissions.length > 0 
          ? (successfulSubmissions.length / submissions.length) * 100 
          : 0,
        retryRate: submissions.length > 0 
          ? (retrySubmissions.length / submissions.length) * 100 
          : 0,
        errorCategories
      },
      storagePerformance: {
        avgReadTime: this.calculateAverage(storageReads),
        avgWriteTime: this.calculateAverage(storageWrites),
        cacheHitRate: 0, // Would need cache-specific metrics
        storageSize: this.estimateStorageSize()
      },
      criticalIssues: this.getPerformanceIssues(),
      recommendations: this.generateRecommendations()
    }

    return insights
  }

  /**
   * Calculate average duration for metrics
   */
  private calculateAverage(metrics: PerformanceMetric[]): number {
    return metrics.length > 0 
      ? metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length 
      : 0
  }

  /**
   * Estimate storage size usage
   */
  private estimateStorageSize(): number {
    if (typeof window === 'undefined') return 0
    
    try {
      let totalSize = 0
      
      // Session storage
      for (let key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key)) {
          totalSize += sessionStorage[key].length
        }
      }
      
      // Local storage
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length
        }
      }
      
      return totalSize
    } catch (error) {
      return 0
    }
  }

  /**
   * Generate performance recommendations based on current metrics
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    const insights = this.getBottlenecks()
    
    // Add specific recommendations based on performance patterns
    if (insights.some(i => i.metric.name.includes('validation') && i.severity === 'critical')) {
      recommendations.push('Implement validation caching and debouncing optimization')
    }
    
    if (insights.some(i => i.metric.name.includes('submission') && i.severity === 'critical')) {
      recommendations.push('Optimize submission flow with request batching and better error handling')
    }
    
    if (insights.some(i => i.metric.name.includes('cart') && i.severity === 'warning')) {
      recommendations.push('Consider memoizing cart calculations and optimizing state updates')
    }
    
    if (insights.some(i => i.metric.name.includes('storage') && i.severity === 'warning')) {
      recommendations.push('Implement storage cleanup and consider data compression')
    }
    
    // General recommendations based on metric patterns
    const avgFormLoad = this.calculateAverage(this.getMetricsByPattern('form_load'))
    if (avgFormLoad > 2000) {
      recommendations.push('Consider code splitting and lazy loading for form components')
    }
    
    const storageSize = this.estimateStorageSize()
    if (storageSize > 1024 * 1024) { // 1MB
      recommendations.push('Storage usage is high - implement cleanup strategies')
    }
    
    return recommendations.length > 0 ? recommendations : ['Performance is within acceptable ranges']
  }
}

// Global instance for checkout performance monitoring
export const checkoutPerformanceMonitor = new PerformanceMonitor()

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor() {
  return {
    start: checkoutPerformanceMonitor.start.bind(checkoutPerformanceMonitor),
    end: checkoutPerformanceMonitor.end.bind(checkoutPerformanceMonitor),
    record: checkoutPerformanceMonitor.record.bind(checkoutPerformanceMonitor),
    getMetrics: checkoutPerformanceMonitor.getMetrics.bind(checkoutPerformanceMonitor),
    getSummary: checkoutPerformanceMonitor.getSummary.bind(checkoutPerformanceMonitor),
    getPerformanceIssues: checkoutPerformanceMonitor.getPerformanceIssues.bind(checkoutPerformanceMonitor),
    getCheckoutInsights: checkoutPerformanceMonitor.getCheckoutInsights.bind(checkoutPerformanceMonitor),
    clear: checkoutPerformanceMonitor.clear.bind(checkoutPerformanceMonitor)
  }
}

/**
 * Performance monitoring decorator for async functions
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  metricName: string,
  monitor: PerformanceMonitor = checkoutPerformanceMonitor
): T {
  return (async (...args: any[]) => {
    monitor.start(metricName, { args: args.length })
    try {
      const result = await fn(...args)
      monitor.end(metricName, { success: true })
      return result
    } catch (error) {
      monitor.end(metricName, { success: false, error: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  }) as T
}