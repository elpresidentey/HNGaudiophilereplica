"use client"

import { useState, useEffect } from 'react'
import { usePerformanceMonitor } from '@/lib/performanceMonitor'

export default function PerformanceSummary() {
  const performanceMonitor = usePerformanceMonitor()
  const [isVisible, setIsVisible] = useState(false)
  const [summary, setSummary] = useState<any>({})
  const [issues, setIssues] = useState<any[]>([])
  const [checkoutInsights, setCheckoutInsights] = useState<any>({})
  const [bottlenecks, setBottlenecks] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<string[]>([])

  useEffect(() => {
    // Disabled in development for cleaner checkout experience
    if (process.env.NODE_ENV === 'development') {
      return
    }

    const updateSummary = () => {
      setSummary(performanceMonitor.getSummary())
      setIssues(performanceMonitor.getPerformanceIssues())
      
      // Get checkout-specific insights
      try {
        const insights = performanceMonitor.getCheckoutInsights()
        setCheckoutInsights(insights)
        setRecommendations(insights.recommendations || [])
        
        // Get bottlenecks if method exists
        if (typeof (performanceMonitor as any).getBottlenecks === 'function') {
          setBottlenecks((performanceMonitor as any).getBottlenecks())
        }
      } catch (error) {
        // Fallback if method doesn't exist
        setCheckoutInsights({})
        setRecommendations([])
        setBottlenecks([])
      }
    }

    // Update summary every 2 seconds
    const interval = setInterval(updateSummary, 2000)
    updateSummary()

    return () => clearInterval(interval)
  }, [performanceMonitor])

  // Don't render the performance panel
  return null

  const summaryEntries = Object.entries(summary)
  const hasData = summaryEntries.length > 0

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
          issues.length > 0 
            ? 'bg-red-600 text-white' 
            : hasData 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-600 text-white'
        }`}
        title={`Performance Monitor - ${issues.length} issues detected`}
      >
        ⚡ {issues.length > 0 && `${issues.length} issues`}
      </button>

      {isVisible && (
        <div className="absolute bottom-12 right-0 w-[480px] max-h-[600px] overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-sm">Performance Monitor</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const data = {
                    metrics: performanceMonitor.getMetrics(),
                    summary: performanceMonitor.getSummary(),
                    insights: checkoutInsights
                  }
                  console.log('Performance Data:', data)
                  navigator.clipboard?.writeText(JSON.stringify(data, null, 2))
                }}
                className="text-xs bg-gray-100 px-2 py-1 rounded"
                title="Copy to clipboard"
              >
                Copy
              </button>
              <button
                onClick={() => performanceMonitor.clear()}
                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
                title="Clear metrics"
              >
                Clear
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-xs bg-gray-100 px-2 py-1 rounded"
              >
                ×
              </button>
            </div>
          </div>

          {issues.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <h4 className="font-bold text-xs text-red-800 mb-2">
                Performance Issues ({issues.length})
              </h4>
              <div className="space-y-1">
                {issues.map((issue, index) => (
                  <div key={index} className="text-xs text-red-700">
                    <span className="font-medium">{issue.name}:</span> {issue.duration}ms
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Checkout Insights */}
          {checkoutInsights.formPerformance && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-bold text-xs text-blue-800 mb-2">Checkout Performance</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                <div>Form Load: {Math.round(checkoutInsights.formPerformance.avgLoadTime)}ms</div>
                <div>Validation: {Math.round(checkoutInsights.formPerformance.avgValidationTime)}ms</div>
                <div>Cache Hit: {Math.round(checkoutInsights.formPerformance.validationCacheHitRate)}%</div>
                <div>Cart Ops: {Math.round(checkoutInsights.cartPerformance.avgOperationTime)}ms</div>
                <div>Success Rate: {Math.round(checkoutInsights.submissionPerformance.successRate)}%</div>
                <div>Retry Rate: {Math.round(checkoutInsights.submissionPerformance.retryRate)}%</div>
              </div>
              {checkoutInsights.formPerformance.slowValidations?.length > 0 && (
                <div className="mt-2 text-xs text-yellow-700">
                  <div className="font-medium">Slow Validations:</div>
                  <div className="text-xs">{checkoutInsights.formPerformance.slowValidations.join(', ')}</div>
                </div>
              )}
            </div>
          )}

          {/* Performance Bottlenecks */}
          {bottlenecks.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-bold text-xs text-yellow-800 mb-2">
                Performance Bottlenecks ({bottlenecks.length})
              </h4>
              <div className="space-y-2">
                {bottlenecks.slice(0, 3).map((bottleneck, index) => (
                  <div key={index} className="text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-yellow-800">{bottleneck.metric.name}</span>
                      <span className={`px-1 rounded text-xs ${
                        bottleneck.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        bottleneck.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {bottleneck.severity}
                      </span>
                    </div>
                    <div className="text-yellow-700">{bottleneck.metric.duration}ms</div>
                    <div className="text-yellow-600 text-xs mt-1">{bottleneck.recommendation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Recommendations */}
          {recommendations.length > 0 && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
              <h4 className="font-bold text-xs text-green-800 mb-2">Recommendations</h4>
              <div className="space-y-1">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="text-xs text-green-700 flex items-start">
                    <span className="mr-1 mt-0.5">•</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasData ? (
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-gray-700 mb-2">Metrics Summary</h4>
              {summaryEntries.map(([name, data]: [string, any]) => (
                <div key={name} className="text-xs border-b border-gray-100 pb-2">
                  <div className="font-medium text-gray-800">{name}</div>
                  <div className="text-gray-600 grid grid-cols-3 gap-2 mt-1">
                    <span>Avg: {Math.round(data.avgDuration)}ms</span>
                    <span>Max: {data.maxDuration}ms</span>
                    <span>Count: {data.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500 text-center py-4">
              No performance data yet
            </div>
          )}
        </div>
      )}
    </div>
  )
}