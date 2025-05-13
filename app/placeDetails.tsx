import React, { useState, useEffect } from 'react';
import { Text, ScrollView, Image, StyleSheet, View, Button } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { db } from '../FirebaseConfig';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { getProfileInformation } from '../components/userFuncs';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#555',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  accessibilityInfo: {
    fontSize: 16,
    marginBottom: 5,
    color: '#777',
  },
  accessibilityLabel: {
    fontWeight: 'bold',
    color: '#555',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  photoContainer: {
    width: '48%', // Two photos per row with some spacing
    aspectRatio: 1,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  photo: {
    flex: 1,
    resizeMode: 'cover',
  },
  noPhotosText: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
  navigateButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 25,
  },
  navigateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default function placeDetails() {
  const { id } = useLocalSearchParams();
  const [place, setPlace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [photoURLs, setPhotoURLs] = useState<string[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [submitterDisplayName, setSubmitterName] = useState<string | null>(null);

  const router = useRouter();

  const startRouting = () => {
    console.log('Start routing to:', place?.place_coordinates);
    router.push(`/?latitude=${place.place_coordinates.latitude}&longitude=${place.place_coordinates.longitude}`);
  };

  const reviewPercentage = (reviews: any[]) => {
  if (reviews.length === 0) return 0;
  const recommendedCount = reviews.filter((review) => review.recommended === true).length;
  const notRecommendedCount = reviews.filter((review) => review.recommended === false).length;
  return Math.round((recommendedCount / (recommendedCount + notRecommendedCount)) * 100);
  };

  //inspired by steam's rating system
  const reviewClassification = (percentage: number): string => {
    if (percentage === 0) {
      return "No Reviews";
    } else if (percentage <= 19) {
      return "Negative";
    } else if (percentage <= 39 ) {
      return "Mostly Negative";
    } else if (percentage <= 69) {
      return "Mixed";
    } else if (percentage <= 79) {
      return "Mostly Positive";
    } else if (percentage <= 100) {
      return "Positive";
    }
  }

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      if (typeof id === 'string') {
        try {
          const docRef = doc(db, 'places', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const placeData = docSnap.data();
            console.log('Fetched place details:', placeData);
            setPlace(placeData);

            if (placeData.place_original_submitter_id) {
              const profileInfo = await getProfileInformation(placeData.place_original_submitter_id);
              setSubmitterName(profileInfo?.displayName || 'Missing Display Name');
            }

          } else {
            console.error('No such document!');
          }
        } catch (error) {
          console.error('Error fetching place details:', error);
        } finally {
          setLoading(false);
        }
      } else {
        console.error('Invalid ID format:', id);
        setLoading(false);
      }
    };

    const getPhotos = async () => {
      const storage = getStorage();
      try {
        const photosRef = ref(storage, `photos/${id}/`);
        const photoList = await listAll(photosRef);
        const urls = await Promise.all(
          photoList.items.map((item) => getDownloadURL(item))
        );
        setPhotoURLs(urls);
        console.log(`Got ${urls.length} photos for place ID ${id}`);
      } catch (error) {
        console.error('Error fetching photos:', error);
      }
    };

    const getReviews = async () => {
      try {
        const placeReference = doc(db, 'places', id);

        const getReviewsQuery = query(
          collection(db, 'reviews'),
          where('review_placeid', '==', placeReference)
        );
        const querySnapshot = await getDocs(getReviewsQuery);

        //get review data, and also fetch profile information for the author of each review
        //maybe we can also use this to display profile pictures later
        const reviewsData = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const review = doc.data();
            const profileInfo = await getProfileInformation(review.review_authorid);
            return {
              ...review,
              displayName: profileInfo?.displayName || 'Missing Display Name', //append display name to the review data
            };
          })
        );

        console.log('Fetched reviews with display names:', reviewsData);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchPlaceDetails();
    getPhotos();
    getReviews();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#777' }}>Loading place details...</Text>
      </View>
    );
  }

  console.log('Photo URLs:', photoURLs);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{place?.place_name || 'Place Details'}</Text>

      <Text style={styles.sectionTitle}>General Information</Text>
      <Text style={styles.infoText}>Address: {place?.place_address || 'Data missing'}</Text>
      <Text style={styles.infoText}>Phone: {place?.place_phonenumber || 'Data missing'}</Text>
      <Text style={styles.infoText}>Submitted by: {submitterDisplayName}</Text>
      <Text style={styles.infoText}>Submitted at: {place?.place_submission_timestamp ? new Date(place.place_submission_timestamp).toLocaleString() : 'Data missing'}
      </Text>
      {place?.place_description && <Text style={styles.infoText}>Description: {place.place_description}</Text>}

      <Text style={styles.sectionTitle}>Accessibility Information</Text>
      <Text style={styles.accessibilityInfo}>
        <Text style={styles.accessibilityLabel}>Wheelchair Accessibility:</Text> {place?.place_wheelchair_accessible !== undefined ? (place.place_wheelchair_accessible ? 'Yes' : 'No') : 'Data missing'}
      </Text>
      {place?.place_wheelchair_description && (
        <Text style={styles.accessibilityInfo}>
          <Text style={styles.accessibilityLabel}>Details:</Text> {place.place_wheelchair_description}
        </Text>)}

      <Text style={styles.accessibilityInfo}>
        <Text style={styles.accessibilityLabel}>Vision Accessibility:</Text> {place?.place_blind_accessible !== undefined ? (place.place_blind_accessible ? 'Yes' : 'No') : 'Data missing'}
      </Text>
      {place?.place_blind_description && (
        <Text style={styles.accessibilityInfo}>
          <Text style={styles.accessibilityLabel}>Details:</Text> {place.place_blind_description}
        </Text>)}

      <Text style={styles.accessibilityInfo}>
        <Text style={styles.accessibilityLabel}>Hearing Accessibility:</Text> {place?.place_auditory_accessible !== undefined ? (place.place_auditory_accessible ? 'Yes' : 'No') : 'Data missing'}
      </Text>
      {place?.place_auditory_description && (
        <Text style={styles.accessibilityInfo}>
          <Text style={styles.accessibilityLabel}>Details:</Text> {place.place_auditory_description}
        </Text>)}

      <Text style={styles.sectionTitle}>Photos</Text>
      {photoURLs.length > 0 ? (
        <View style={styles.photoGrid}>
          {photoURLs.map((url, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: url }} style={styles.photo} />
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noPhotosText}>No photos available (may take a few seconds to load).</Text>
      )}

      <Button title="Navigate Here" style={styles.navigateButton} onPress={startRouting} />
      <Button title="Write a Review" onPress={() => router.push(`writeReview/?place=${id}`)}/>

      <Text style={styles.sectionTitle}>Reviews</Text>
      {reviews.length > 0 && (
        <Text>
          {reviewPercentage(reviews)}% of reviewers recommend this place ({reviewClassification(reviewPercentage(reviews))})
        </Text>
      )}
      {reviews.length > 0 ? (
        reviews.map((review, index) => (
          <View key={index} style={{ marginVertical: 10 }}>
            <Text>{review.recommended !== undefined ? (review.recommended ? '👍 Recommended' : '👎 Not Recommended') : 'Recommendation Missing'}</Text>
            <Text>Comment: {review.review_text || 'Missing text'}</Text>
            <Text>Wheelchair Accessibility Rating: {review.review_wheelchair_rating || 'n.a'}/5 </Text>
            <Text>Visual Accessibility Rating: {review.review_blind_rating || 'n.a'}/5 </Text>
            <Text>Auditory Accessibility Rating: {review.review_auditory_rating || 'n.a'}/5 </Text>
            <Text>Author: {review.displayName || 'Missing display name'}</Text>
            <Text>{review.review_timestamp ? new Date(review.review_timestamp).toLocaleString(): 'Missing timestamp'}</Text>
          </View>
        ))
      ) : (
        <Text>No reviews available</Text>
      )}

    </ScrollView>
  );
}