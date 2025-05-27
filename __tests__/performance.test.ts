import { performance } from 'perf_hooks';
import { PerformanceTest } from '../utils/performanceUtils';

// Example functions to test
const simulateAPICall = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { data: 'test data' };
};

const heavyComputation = (iterations: number) => {
  let result = 0;
  for (let i = 0; i < iterations; i++) {
    result += Math.random();
  }
  return result;
};

describe('Performance Tests', () => {
  beforeEach(() => {
    PerformanceTest.clearResults();
  });

  // Test synchronous operation
  it('should measure sync operation performance', () => {
    const result = PerformanceTest.measure('heavyComputation', () => {
      return heavyComputation(1000000);
    });

    const metrics = PerformanceTest.getResults();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].duration).toBeLessThan(1000); // Should complete within 1 second
    expect(metrics[0].memoryUsed).toBeLessThan(50); // Should use less than 50MB
  });

  // Test asynchronous operation
  it('should measure async operation performance', async () => {
    const result = await PerformanceTest.measureAsync('apiCall', async () => {
      return await simulateAPICall();
    });

    const metrics = PerformanceTest.getResults();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].duration).toBeGreaterThanOrEqual(500);
    expect(metrics[0].duration).toBeLessThan(600);
  });

  // Test performance consistency with benchmarking
  it('should benchmark operation consistency', () => {
    const benchmarkResult = PerformanceTest.benchmark(
      'consistencyTest',
      () => heavyComputation(100000),
      5
    );

    console.log('Benchmark Results:', benchmarkResult);

    expect(benchmarkResult.averageTime).toBeLessThan(500);
    expect(benchmarkResult.standardDeviation).toBeLessThan(
      benchmarkResult.averageTime * 0.25
    ); // Std dev should be less than 25% of mean
  });

  // Test multiple operations
  it('should track multiple operations', async () => {
    // Measure sync operation
    PerformanceTest.measure('syncOp', () => heavyComputation(100000));

    // Measure async operation
    await PerformanceTest.measureAsync('asyncOp', simulateAPICall);

    const metrics = PerformanceTest.getResults();
    expect(metrics).toHaveLength(2);
    
    console.log('Performance Metrics:', JSON.stringify(metrics, null, 2));
  });
}); 