/**
 * Performance Monitoring Utilities
 *
 * Tools for measuring and tracking application performance
 */

import { useEffect, useRef } from 'react';
import { trackTiming } from './analytics';

/**
 * Measure component render time
 */
export function useRenderTime(componentName: string) {
  const renderStart = useRef<number>(performance.now());

  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
    }

    // Track in analytics
    trackTiming('component_render', componentName, Math.round(renderTime));
  }, [componentName]);
}

/**
 * Measure page load time
 */
export function measurePageLoad() {
  if (typeof window === 'undefined') return null;

  const perfData = window.performance?.timing;
  if (!perfData) return null;

  return {
    // Page load time
    pageLoad: perfData.loadEventEnd - perfData.navigationStart,

    // DOM ready
    domReady: perfData.domContentLoadedEventEnd - perfData.navigationStart,

    // DNS lookup
    dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart,

    // TCP connection
    tcpConnection: perfData.connectEnd - perfData.connectStart,

    // Server response
    serverResponse: perfData.responseEnd - perfData.requestStart,

    // DOM processing
    domProcessing: perfData.domComplete - perfData.domLoading,

    // Time to first byte
    ttfb: perfData.responseStart - perfData.navigationStart,
  };
}

/**
 * Measure Core Web Vitals
 */
export function measureCoreWebVitals(callback?: (metric: WebVitalMetric) => void) {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint (LCP)
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;

      const metric: WebVitalMetric = {
        name: 'LCP',
        value: lastEntry.renderTime || lastEntry.loadTime,
        rating: getRating('LCP', lastEntry.renderTime || lastEntry.loadTime),
      };

      callback?.(metric);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // LCP not supported
  }

  // First Input Delay (FID)
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        const metric: WebVitalMetric = {
          name: 'FID',
          value: entry.processingStart - entry.startTime,
          rating: getRating('FID', entry.processingStart - entry.startTime),
        };

        callback?.(metric);
      });
    }).observe({ entryTypes: ['first-input'] });
  } catch (e) {
    // FID not supported
  }

  // Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });

      const metric: WebVitalMetric = {
        name: 'CLS',
        value: clsValue,
        rating: getRating('CLS', clsValue),
      };

      callback?.(metric);
    }).observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    // CLS not supported
  }
}

/**
 * Performance mark
 */
export function mark(name: string) {
  if (typeof performance === 'undefined') return;
  performance.mark(name);
}

/**
 * Performance measure
 */
export function measure(name: string, startMark: string, endMark?: string): number {
  if (typeof performance === 'undefined') return 0;

  if (!endMark) {
    performance.mark(`${name}-end`);
    endMark = `${name}-end`;
  }

  performance.measure(name, startMark, endMark);

  const entries = performance.getEntriesByName(name, 'measure');
  const duration = entries[entries.length - 1]?.duration || 0;

  return duration;
}

/**
 * Measure async operation
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
  }

  trackTiming('async_operation', name, Math.round(duration));

  return { result, duration };
}

/**
 * Hook to measure async operations
 */
export function useMeasureAsync() {
  return async <T>(name: string, fn: () => Promise<T>) => {
    return measureAsync(name, fn);
  };
}

/**
 * Measure function execution time
 */
export function measureSync<T>(name: string, fn: () => T): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * Get memory usage (if available)
 */
export function getMemoryUsage(): MemoryInfo | null {
  if (typeof performance === 'undefined') return null;

  const memory = (performance as any).memory;
  if (!memory) return null;

  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usedPercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
  };
}

/**
 * Monitor memory usage
 */
export function useMemoryMonitor(intervalMs: number = 5000) {
  useEffect(() => {
    const interval = setInterval(() => {
      const memory = getMemoryUsage();
      if (memory && memory.usedPercent > 90) {
        console.warn('[Performance] High memory usage:', memory);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);
}

/**
 * Get FPS (frames per second)
 */
export function measureFPS(callback: (fps: number) => void, duration: number = 1000) {
  if (typeof window === 'undefined') return;

  let frameCount = 0;
  let lastTime = performance.now();
  let rafId: number;

  const countFrame = () => {
    frameCount++;
    const currentTime = performance.now();

    if (currentTime >= lastTime + duration) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      callback(fps);

      frameCount = 0;
      lastTime = currentTime;
    }

    rafId = requestAnimationFrame(countFrame);
  };

  rafId = requestAnimationFrame(countFrame);

  // Return cleanup function
  return () => cancelAnimationFrame(rafId);
}

/**
 * Bundle size reporter
 */
export function reportBundleSize() {
  if (typeof window === 'undefined') return;

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  const scripts = resources.filter(r => r.name.endsWith('.js'));
  const styles = resources.filter(r => r.name.endsWith('.css'));

  const totalScriptSize = scripts.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  const totalStyleSize = styles.reduce((sum, r) => sum + (r.transferSize || 0), 0);

  return {
    scripts: {
      count: scripts.length,
      totalSize: totalScriptSize,
      avgSize: totalScriptSize / scripts.length,
    },
    styles: {
      count: styles.length,
      totalSize: totalStyleSize,
      avgSize: totalStyleSize / styles.length,
    },
    total: totalScriptSize + totalStyleSize,
  };
}

/**
 * Network information
 */
export function getNetworkInfo(): NetworkInfo | null {
  if (typeof navigator === 'undefined') return null;

  const connection = (navigator as any).connection ||
                    (navigator as any).mozConnection ||
                    (navigator as any).webkitConnection;

  if (!connection) return null;

  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };
}

/**
 * Types
 */
export interface WebVitalMetric {
  name: 'LCP' | 'FID' | 'CLS';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usedPercent: number;
}

export interface NetworkInfo {
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

/**
 * Get performance rating
 */
function getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
  };

  const threshold = thresholds[metric as keyof typeof thresholds];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Performance budget checker
 */
export function checkPerformanceBudget(budget: PerformanceBudget): BudgetResult {
  const pageLoad = measurePageLoad();
  const bundle = reportBundleSize();
  const memory = getMemoryUsage();

  const results: BudgetResult = {
    passed: true,
    violations: [],
  };

  if (pageLoad && budget.pageLoadTime && pageLoad.pageLoad > budget.pageLoadTime) {
    results.passed = false;
    results.violations.push({
      metric: 'Page Load Time',
      value: pageLoad.pageLoad,
      budget: budget.pageLoadTime,
    });
  }

  if (bundle && budget.totalBundleSize && bundle.total > budget.totalBundleSize) {
    results.passed = false;
    results.violations.push({
      metric: 'Bundle Size',
      value: bundle.total,
      budget: budget.totalBundleSize,
    });
  }

  if (memory && budget.memoryUsagePercent && memory.usedPercent > budget.memoryUsagePercent) {
    results.passed = false;
    results.violations.push({
      metric: 'Memory Usage',
      value: memory.usedPercent,
      budget: budget.memoryUsagePercent,
    });
  }

  return results;
}

export interface PerformanceBudget {
  pageLoadTime?: number;
  totalBundleSize?: number;
  memoryUsagePercent?: number;
}

export interface BudgetResult {
  passed: boolean;
  violations: Array<{
    metric: string;
    value: number;
    budget: number;
  }>;
}
