import { performance } from 'perf_hooks';
import { PerformanceTest } from '../utils/performanceUtils';
import { reviewClassification, reviewPercentage } from '../components/review';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../FirebaseConfig';

// Mock Firebase
jest.mock('../FirebaseConfig', () => ({
  db: {
    collection: jest.fn(),
  },
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
}));

describe('Map Application Performance Tests', () => {
  beforeEach(() => {
    PerformanceTest.clearResults();
  });

  // Test review classification performance
  it('should measure review classification performance', () => {
    const testCases = [0, 10, 30, 50, 75, 90];
    
    const result = PerformanceTest.benchmark(
      'reviewClassification',
      () => {
        testCases.forEach(percentage => {
          reviewClassification(percentage);
        });
      },
      100 // Run 100 iterations
    );

    console.log('Review Classification Performance:', result);
    // Actual result shows ~0.00045ms average, setting threshold to 0.02ms
    expect(result.averageTime).toBeLessThan(0.02);
    // Standard deviation was ~0.0015, setting threshold to 0.01
    expect(result.standardDeviation).toBeLessThan(0.01);
  });

  // Test review percentage calculation performance
  it('should measure review percentage calculation performance', () => {
    const testReviews = Array(1000).fill(null).map(() => ({
      recommended: Math.random() > 0.5
    }));

    const result = PerformanceTest.benchmark(
      'reviewPercentage',
      () => {
        reviewPercentage(testReviews);
      },
      50 // Run 50 iterations
    );

    console.log('Review Percentage Calculation Performance:', result);
    // Actual result shows ~0.021ms average, setting threshold to 0.1ms
    expect(result.averageTime).toBeLessThan(0.1);
    // Memory usage was ~0.022MB, setting threshold to 0.1MB
    expect(result.averageMemory).toBeLessThan(0.1);
  });

  // Test place retrieval performance
  it('should measure place retrieval performance', async () => {
    // Mock data
    const mockPlaces = Array(100).fill(null).map((_, index) => ({
      id: `place${index}`,
      data: () => ({
        place_name: `Place ${index}`,
        place_description: `Description ${index}`,
        place_coordinates: {
          latitude: -37.8136 + Math.random() * 0.1,
          longitude: 144.9631 + Math.random() * 0.1,
        }
      })
    }));

    // Mock Firebase response
    (getDocs as jest.Mock).mockResolvedValue({
      docs: mockPlaces
    });

    const result = await PerformanceTest.measureAsync(
      'placeRetrieval',
      async () => {
        const querySnapshot = await getDocs(collection(db, 'places'));
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }
    );

    const metrics = PerformanceTest.getResults();
    expect(metrics).toHaveLength(1);
    // Actual result shows ~0.16ms duration, setting threshold to 1ms
    expect(metrics[0].duration).toBeLessThan(1);
    console.log('Place Retrieval Performance:', metrics[0]);
  });

  // Test place filtering performance (simulating search)
  it('should measure place filtering performance', () => {
    // Create a large dataset of places
    const places = Array(1000).fill(null).map((_, index) => ({
      id: `place${index}`,
      place_name: `Place ${index}`,
      place_description: `Description for place ${index}`,
      place_coordinates: {
        latitude: -37.8136 + Math.random() * 0.1,
        longitude: 144.9631 + Math.random() * 0.1,
      }
    }));

    const searchTerm = 'Place 5';

    const result = PerformanceTest.benchmark(
      'placeFiltering',
      () => {
        const filtered = places.filter(place => 
          place.place_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          place.place_description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return filtered;
      },
      100 // Run 100 iterations
    );

    console.log('Place Filtering Performance:', result);
    // Setting thresholds based on typical search performance
    expect(result.averageTime).toBeLessThan(1); // 1ms threshold
    expect(result.standardDeviation).toBeLessThan(0.5); // 0.5ms standard deviation threshold
  });
}); 