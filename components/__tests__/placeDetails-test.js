import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PlaceDetails from '../../app/placeDetails';
import { reviewClassification, reviewPercentage } from '../../components/review';
import { getDoc } from 'firebase/firestore';
import { getProfileInformation } from '../../components/userFuncs';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

jest.mock('../../FirebaseConfig', () => ({
  db: {},
}));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  query: jest.fn(),
  collection: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  listAll: jest.fn(),
  getDownloadURL: jest.fn(),
}));
jest.mock('../../components/userFuncs', () => ({
  getProfileInformation: jest.fn(),
}));
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'test-id' }),
  useRouter: () => ({ push: jest.fn() }),
}));

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

describe('PlaceDetails Component', () => {
  it('shows loading indicator while fetching', async () => {
    const { getByText } = render(<PlaceDetails />);
    await waitFor(() => {
      expect(getByText('Loading place details...')).toBeTruthy();
    });
  });

  it('correctly renders text from fetched place details', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({"place_address": "21 Woodbury St, Strathdale VIC 3550, Australia", 
                    "place_auditory_accessible": false, 
                    "place_auditory_description": "", 
                    "place_blind_accessible": true, 
                    "place_blind_description": "There are braille signs", 
                    "place_coordinates": {"latitude": -36.76102238948107, "longitude": 144.31159554049373}, 
                    "place_description": "They serve some nice food", 
                    "place_name": "Bendigo Club", 
                    "place_original_submitter_id": "fR7mOsK3qgXtII3ZSX7chXN0i2z2", 
                    "place_owner_id": null, 
                    "place_phonenumber": "0867589", 
                    "place_submission_timestamp": "2025-05-16T01:54:21.997Z", 
                    "place_wheelchair_accessible": true, 
                    "place_wheelchair_description": "This place has a wheelchair by the front door"
      }),
    });
    getProfileInformation.mockResolvedValue({ displayName: 'Pickle the cat' });
    const { getByText } = render(<PlaceDetails />);

    await waitFor(() => {
      expect(getByText('Bendigo Club')).toBeTruthy();
      expect(getByText(/Address: 21 Woodbury St, Strathdale VIC 3550, Australia/)).toBeTruthy();
      expect(getByText(/Phone: 0867589/)).toBeTruthy();
      expect(getByText(/Submitted by: Pickle the cat/)).toBeTruthy();
      expect(getByText(`Submitted at: \n16/05/2025, 11:54:21 am`)).toBeTruthy();
      expect(getByText(/Description: They serve some nice food/)).toBeTruthy();
      expect(getByText(/Wheelchair Accessibility: Yes/)).toBeTruthy();
      expect(getByText(/Details: This place has a wheelchair by the front door/)).toBeTruthy();
      expect(getByText(/Vision Accessibility: Yes/)).toBeTruthy();
      expect(getByText(/Details: There are braille signs/)).toBeTruthy();
      expect(getByText(/Hearing Accessibility: No/)).toBeTruthy();
    });
  });
});

