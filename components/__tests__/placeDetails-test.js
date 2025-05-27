import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
//import PlaceDetails from '../../app/placeDetails';
import { reviewClassification, reviewPercentage } from '../../components/review';

describe('reviewClassification', () => {
  it('review classifier returns no reviews for 0', () => {
    expect(reviewClassification(0)).toBe("No Reviews");
  });

  it('review classifier returns negative for 1 and 19', () => {
    expect(reviewClassification(1)).toBe("Negative");
    expect(reviewClassification(19)).toBe("Negative");
  });

  it('review classifier returns mostly negative for 20 to 39', () => {
    expect(reviewClassification(20)).toBe("Mostly Negative");
    expect(reviewClassification(39)).toBe("Mostly Negative");
  });

  it('review classifier returns mixed for 40 to 69', () => {
    expect(reviewClassification(40)).toBe("Mixed");
    expect(reviewClassification(69)).toBe("Mixed");
  });

  it('review classifier returns mostly positive for 70 to 79', () => {
    expect(reviewClassification(70)).toBe("Mostly Positive");
    expect(reviewClassification(79)).toBe("Mostly Positive");
  });

  it('review classifier returns positive for 80 to 100', () => {
    expect(reviewClassification(80)).toBe("Positive");
    expect(reviewClassification(100)).toBe("Positive");
  });
});

describe('reviewAverage', () => {
  it('returns average of 50% with 1 positive and 1 negative', () => {
    const reviews = [{"recommended": true}, {"recommended": false}];
    expect(reviewPercentage(reviews)).toBe(50);
  });

  it('returns 0 for empty reviews', () => {
    const reviews = [];
    expect(reviewPercentage(reviews)).toBe(0);
  });

  it('returns 100% for all positive reviews', () => {
    const reviews = [{"recommended": true}, {"recommended": true}];
    expect(reviewPercentage(reviews)).toBe(100);
  });

  it('returns 0% for all negative reviews', () => {
    const reviews = [{"recommended": false}, {"recommended": false}];
    expect(reviewPercentage(reviews)).toBe(0);
  });

  it('returns 75% for 3 positive and 1 negative review', () => {
    const reviews = [{"recommended": true}, {"recommended": true}, {"recommended": true}, {"recommended": false}];
    expect(reviewPercentage(reviews)).toBe(75);
  });

  it('returns 25% for 1 positive and 3 negative reviews', () => {
    const reviews = [{"recommended": true}, {"recommended": false}, {"recommended": false}, {"recommended": false}];
    expect(reviewPercentage(reviews)).toBe(25);
  });
});


