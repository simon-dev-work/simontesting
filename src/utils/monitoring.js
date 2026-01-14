// Error logging utility
const logError = (error, context = {}) => {
  const errorInfo = {
    error: error?.message || 'Unknown error',
    stack: error?.stack,
    timestamp: new Date().toISOString(),
    ...context
  };
  
  // In production, this would send to your error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { extra: context });
    console.error('Error logged:', errorInfo);
  } else {
    console.error('Development Error:', errorInfo);
  }
};

// Performance tracking utility
const trackPerformance = (metricName, duration, meta = {}) => {
  const data = {
    name: metricName,
    duration: `${duration.toFixed(2)}ms`,
    timestamp: new Date().toISOString(),
    ...meta
  };
  
  // In production, this would send to your analytics service
  if (process.env.NODE_ENV === 'production') {
    // Example: analytics.track('performance_metric', data);
    console.debug('Performance:', data);
  }
};

export { logError, trackPerformance };
