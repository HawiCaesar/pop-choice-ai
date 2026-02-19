/**
 * Performance tracking utilities for E2E tests
 */

export class PerformanceTracker {
  constructor() {
    this.metrics = {
      startTime: null,
      endTime: null,
      duration: null,
      checkpoints: []
    };
  }

  start() {
    this.metrics.startTime = Date.now();
    this.metrics.checkpoints = [];
    return this;
  }

  checkpoint(name) {
    const now = Date.now();
    const elapsed = this.metrics.startTime ? now - this.metrics.startTime : 0;
    this.metrics.checkpoints.push({
      name,
      timestamp: now,
      elapsed
    });
    return this;
  }

  end() {
    this.metrics.endTime = Date.now();
    if (this.metrics.startTime) {
      this.metrics.duration = this.metrics.endTime - this.metrics.startTime;
    }
    return this;
  }

  getDuration() {
    return this.metrics.duration;
  }

  getCheckpoint(name) {
    return this.metrics.checkpoints.find(cp => cp.name === name);
  }

  getAllCheckpoints() {
    return this.metrics.checkpoints;
  }

  logMetrics() {
    console.log('Performance Metrics:');
    console.log(`Total Duration: ${this.metrics.duration}ms`);
    console.log('Checkpoints:');
    this.metrics.checkpoints.forEach(cp => {
      console.log(`  ${cp.name}: ${cp.elapsed}ms`);
    });
  }

  assertMaxDuration(maxMs) {
    if (this.metrics.duration > maxMs) {
      throw new Error(
        `Performance threshold exceeded: ${this.metrics.duration}ms > ${maxMs}ms`
      );
    }
    return this;
  }
}

export function trackPerformance(testFn) {
  return async (...args) => {
    const tracker = new PerformanceTracker();
    tracker.start();
    
    try {
      const result = await testFn(tracker, ...args);
      tracker.end();
      tracker.logMetrics();
      return result;
    } catch (error) {
      tracker.end();
      tracker.logMetrics();
      throw error;
    }
  };
}
