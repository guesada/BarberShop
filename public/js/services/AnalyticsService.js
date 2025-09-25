/**
 * Elite Barber Shop - Analytics Service
 * Handles user behavior tracking, performance monitoring, and business analytics
 * @version 2.0.0
 */

class AnalyticsService {
  constructor() {
    this.events = [];
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.startTime = Date.now();
    this.pageViews = [];
    this.errors = [];
    this.performance = {};
    this.isEnabled = true;
    
    this.init();
  }

  init() {
    this.setupPerformanceMonitoring();
    this.setupErrorTracking();
    this.setupUserInteractionTracking();
    this.startSession();
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Start analytics session
   */
  startSession() {
    this.track('session_start', {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer
    });
  }

  /**
   * Track custom event
   */
  track(eventName, properties = {}) {
    if (!this.isEnabled) return;

    const event = {
      id: this.generateEventId(),
      name: eventName,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: Date.now(),
        url: window.location.href,
        path: window.location.pathname
      }
    };

    this.events.push(event);
    this.sendEvent(event);

    // Log to console in development
    if (this.isDevelopment()) {
      console.log('📊 Analytics Event:', eventName, properties);
    }
  }

  /**
   * Track page view
   */
  trackPageView(page, title = null) {
    const pageView = {
      page,
      title: title || document.title,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      referrer: this.lastPage || document.referrer
    };

    this.pageViews.push(pageView);
    this.lastPage = page;

    this.track('page_view', pageView);
  }

  /**
   * Track user identification
   */
  identify(userId, traits = {}) {
    this.userId = userId;
    
    this.track('user_identify', {
      userId,
      traits: {
        ...traits,
        identifiedAt: Date.now()
      }
    });
  }

  /**
   * Track business events
   */
  trackAppointmentBooked(appointmentData) {
    this.track('appointment_booked', {
      appointmentId: appointmentData.id,
      barberId: appointmentData.barberId,
      serviceId: appointmentData.serviceId,
      date: appointmentData.date,
      time: appointmentData.time,
      price: appointmentData.price,
      bookingSource: 'web_app'
    });
  }

  trackAppointmentCancelled(appointmentData, reason) {
    this.track('appointment_cancelled', {
      appointmentId: appointmentData.id,
      barberId: appointmentData.barberId,
      reason,
      timeBeforeAppointment: appointmentData.date - Date.now(),
      cancellationSource: 'web_app'
    });
  }

  trackPaymentCompleted(paymentData) {
    this.track('payment_completed', {
      appointmentId: paymentData.appointmentId,
      amount: paymentData.amount,
      method: paymentData.method,
      currency: paymentData.currency || 'BRL',
      processingTime: paymentData.processingTime
    });
  }

  trackServiceRated(ratingData) {
    this.track('service_rated', {
      appointmentId: ratingData.appointmentId,
      barberId: ratingData.barberId,
      serviceId: ratingData.serviceId,
      rating: ratingData.rating,
      comment: ratingData.comment,
      ratingTime: Date.now()
    });
  }

  /**
   * Track user engagement
   */
  trackUserEngagement(action, element, value = null) {
    this.track('user_engagement', {
      action,
      element,
      value,
      timeOnPage: Date.now() - this.pageStartTime
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(feature, action, metadata = {}) {
    this.track('feature_usage', {
      feature,
      action,
      ...metadata
    });
  }

  /**
   * Track search queries
   */
  trackSearch(query, results, filters = {}) {
    this.track('search', {
      query,
      resultsCount: results.length,
      filters,
      hasResults: results.length > 0
    });
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          this.performance.pageLoad = {
            loadTime: perfData.loadEventEnd - perfData.loadEventStart,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            firstPaint: this.getFirstPaint(),
            firstContentfulPaint: this.getFirstContentfulPaint()
          };

          this.track('performance_metrics', this.performance.pageLoad);
        }
      }, 0);
    });

    // Track resource performance
    this.trackResourcePerformance();
  }

  /**
   * Get First Paint timing
   */
  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  /**
   * Get First Contentful Paint timing
   */
  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  }

  /**
   * Track resource performance
   */
  trackResourcePerformance() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 1000) { // Only track slow resources
          this.track('slow_resource', {
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize,
            type: entry.initiatorType
          });
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  /**
   * Setup error tracking
   */
  setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error ? event.error.stack : null,
        type: 'javascript_error'
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: event.reason.message || 'Unhandled Promise Rejection',
        stack: event.reason.stack,
        type: 'promise_rejection'
      });
    });
  }

  /**
   * Track errors
   */
  trackError(errorData) {
    const error = {
      ...errorData,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      userId: this.userId
    };

    this.errors.push(error);
    this.track('error', error);
  }

  /**
   * Setup user interaction tracking
   */
  setupUserInteractionTracking() {
    // Track clicks
    document.addEventListener('click', (event) => {
      const element = event.target;
      const elementInfo = this.getElementInfo(element);
      
      this.trackUserEngagement('click', elementInfo);
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target;
      const formInfo = this.getElementInfo(form);
      
      this.track('form_submit', {
        form: formInfo,
        fields: this.getFormFields(form)
      });
    });

    // Track scroll depth
    this.setupScrollTracking();

    // Track time on page
    this.setupTimeTracking();
  }

  /**
   * Get element information for tracking
   */
  getElementInfo(element) {
    return {
      tagName: element.tagName,
      id: element.id,
      className: element.className,
      text: element.textContent ? element.textContent.substring(0, 100) : null,
      href: element.href,
      type: element.type
    };
  }

  /**
   * Get form fields information
   */
  getFormFields(form) {
    const fields = [];
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      fields.push({
        name: input.name,
        type: input.type,
        required: input.required,
        filled: !!input.value
      });
    });

    return fields;
  }

  /**
   * Setup scroll depth tracking
   */
  setupScrollTracking() {
    let maxScroll = 0;
    const scrollMilestones = [25, 50, 75, 100];
    const trackedMilestones = new Set();

    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );

      maxScroll = Math.max(maxScroll, scrollPercent);

      scrollMilestones.forEach(milestone => {
        if (scrollPercent >= milestone && !trackedMilestones.has(milestone)) {
          trackedMilestones.add(milestone);
          this.track('scroll_depth', { percentage: milestone });
        }
      });
    });
  }

  /**
   * Setup time tracking
   */
  setupTimeTracking() {
    this.pageStartTime = Date.now();
    
    // Track time milestones
    const timeMilestones = [10, 30, 60, 120, 300]; // seconds
    const trackedTimes = new Set();

    setInterval(() => {
      const timeOnPage = Math.round((Date.now() - this.pageStartTime) / 1000);
      
      timeMilestones.forEach(milestone => {
        if (timeOnPage >= milestone && !trackedTimes.has(milestone)) {
          trackedTimes.add(milestone);
          this.track('time_on_page', { seconds: milestone });
        }
      });
    }, 5000);

    // Track when user leaves page
    window.addEventListener('beforeunload', () => {
      const totalTime = Date.now() - this.pageStartTime;
      this.track('page_exit', { timeOnPage: totalTime });
    });
  }

  /**
   * Send event to analytics endpoint
   */
  async sendEvent(event) {
    if (this.isDevelopment()) {
      // In development, just store locally
      this.storeEventLocally(event);
      return;
    }

    try {
      // Send to analytics service (Google Analytics, Mixpanel, etc.)
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      // Fallback to local storage if API fails
      this.storeEventLocally(event);
    }
  }

  /**
   * Store event locally for offline or fallback scenarios
   */
  storeEventLocally(event) {
    const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    storedEvents.push(event);
    
    // Keep only last 1000 events
    if (storedEvents.length > 1000) {
      storedEvents.splice(0, storedEvents.length - 1000);
    }
    
    localStorage.setItem('analytics_events', JSON.stringify(storedEvents));
  }

  /**
   * Get analytics dashboard data
   */
  getDashboardData() {
    return {
      session: {
        id: this.sessionId,
        duration: Date.now() - this.startTime,
        pageViews: this.pageViews.length,
        events: this.events.length
      },
      performance: this.performance,
      errors: this.errors.length,
      topEvents: this.getTopEvents(),
      userFlow: this.getUserFlow()
    };
  }

  /**
   * Get top events by frequency
   */
  getTopEvents() {
    const eventCounts = {};
    this.events.forEach(event => {
      eventCounts[event.name] = (eventCounts[event.name] || 0) + 1;
    });

    return Object.entries(eventCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }

  /**
   * Get user flow through the application
   */
  getUserFlow() {
    return this.pageViews.map(pv => ({
      page: pv.page,
      timestamp: pv.timestamp,
      timeSpent: this.calculateTimeSpent(pv)
    }));
  }

  /**
   * Calculate time spent on page
   */
  calculateTimeSpent(pageView) {
    const nextPageView = this.pageViews.find(pv => 
      pv.timestamp > pageView.timestamp
    );
    
    if (nextPageView) {
      return nextPageView.timestamp - pageView.timestamp;
    }
    
    return Date.now() - pageView.timestamp;
  }

  /**
   * Generate unique event ID
   */
  generateEventId() {
    return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Check if in development mode
   */
  isDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    localStorage.setItem('analytics_enabled', enabled.toString());
  }

  /**
   * Get stored events for batch sending
   */
  getStoredEvents() {
    return JSON.parse(localStorage.getItem('analytics_events') || '[]');
  }

  /**
   * Clear stored events
   */
  clearStoredEvents() {
    localStorage.removeItem('analytics_events');
  }

  /**
   * Export analytics data
   */
  exportData() {
    return {
      session: this.sessionId,
      events: this.events,
      pageViews: this.pageViews,
      errors: this.errors,
      performance: this.performance,
      exportedAt: Date.now()
    };
  }
}

// Export for use in other modules
window.AnalyticsService = AnalyticsService;
