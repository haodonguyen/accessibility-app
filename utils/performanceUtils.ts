import { performance } from 'perf_hooks';

export interface PerformanceResult {
  duration: number;
  memoryUsed: number;
  name: string;
  timestamp: string;
}

export class PerformanceTest {
  private static results: PerformanceResult[] = [];

  /**
   * Measures the execution time and memory usage of a synchronous function
   */
  static measure<T>(name: string, fn: () => T): T {
    const initialMemory = process.memoryUsage().heapUsed;
    const start = performance.now();

    const result = fn();

    const end = performance.now();
    const finalMemory = process.memoryUsage().heapUsed;

    this.results.push({
      duration: end - start,
      memoryUsed: (finalMemory - initialMemory) / 1024 / 1024, // Convert to MB
      name,
      timestamp: new Date().toISOString()
    });

    return result;
  }

  /**
   * Measures the execution time and memory usage of an async function
   */
  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const initialMemory = process.memoryUsage().heapUsed;
    const start = performance.now();

    const result = await fn();

    const end = performance.now();
    const finalMemory = process.memoryUsage().heapUsed;

    this.results.push({
      duration: end - start,
      memoryUsed: (finalMemory - initialMemory) / 1024 / 1024, // Convert to MB
      name,
      timestamp: new Date().toISOString()
    });

    return result;
  }

  /**
   * Runs multiple iterations of a function and returns statistics
   */
  static benchmark(name: string, fn: () => void, iterations: number = 10) {
    const times: number[] = [];
    const memoryUsage: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const initialMemory = process.memoryUsage().heapUsed;
      const start = performance.now();

      fn();

      const end = performance.now();
      const finalMemory = process.memoryUsage().heapUsed;

      times.push(end - start);
      memoryUsage.push((finalMemory - initialMemory) / 1024 / 1024);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / iterations;
    const avgMemory = memoryUsage.reduce((a, b) => a + b, 0) / iterations;

    return {
      name,
      averageTime: avgTime,
      averageMemory: avgMemory,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      standardDeviation: this.calculateStdDev(times)
    };
  }

  /**
   * Gets all recorded performance results
   */
  static getResults(): PerformanceResult[] {
    return this.results;
  }

  /**
   * Clears all recorded performance results
   */
  static clearResults(): void {
    this.results = [];
  }

  private static calculateStdDev(values: number[]): number {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
  }
} 