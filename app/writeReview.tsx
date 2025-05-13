import React, { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { Text, ScrollView, Image, StyleSheet, View, Button, TextInput, Alert, Switch } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc, query, collection, where, getDocs, addDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { auth, db } from '../FirebaseConfig';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  recommendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  recommendText: {
    fontSize: 16,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  ratingInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    width: '60%', // Adjust width as needed
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#444',
  },
  publishButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
  },
  publishButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  ratingContainer: {
    marginBottom: 15,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
    marginRight: 10,
  },
});

export default function placeDetails() {
  const { place } = useLocalSearchParams();
  const [recommended, setRecommended] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [wheelchairRating, setWheelchairRating] = useState('');
  const [blindRating, setBlindRating] = useState('');
  const [auditoryRating, setAuditoryRating] = useState('');

  const router = useRouter();

  const publishReview = async () => {
    try {
      const placeRef = doc(db, 'places', place);

      await addDoc(collection(db, 'reviews'), {
        review_placeid: placeRef, //we set place reference with review to attach it to a place
        review_text: reviewText,
        recommended,
        review_wheelchair_rating: wheelchairRating,
        review_blind_rating: blindRating,
        review_auditory_rating: auditoryRating,
        review_timestamp: new Date().toISOString(),
        review_authorid: auth.currentUser?.uid,
      });

      // Navigate back after successful submission
      router.back();
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review.');
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Write a Review</Text>

      <View style={styles.recommendRow}>
        <Text style={styles.recommendText}>Overall, do you recommend this place?</Text>
        <Switch value={recommended} onValueChange={setRecommended} />
      </View>

      <Text style={styles.label}>Your Review:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your review text here"
        multiline
        numberOfLines={4}
        value={reviewText}
        onChangeText={setReviewText}
      />

      <View style={styles.ratingContainer}>
        <Text style={styles.label}>Accessibility Ratings (1-5):</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>Wheelchair:</Text>
          <TextInput
            style={styles.ratingInput}
            placeholder="e.g., 4"
            keyboardType="numeric"
            value={wheelchairRating}
            onChangeText={setWheelchairRating}
          />
        </View>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>Visual:</Text>
          <TextInput
            style={styles.ratingInput}
            placeholder="e.g., 5"
            keyboardType="numeric"
            value={blindRating}
            onChangeText={setBlindRating}
          />
        </View>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>Auditory:</Text>
          <TextInput
            style={styles.ratingInput}
            placeholder="e.g., 3"
            keyboardType="numeric"
            value={auditoryRating}
            onChangeText={setAuditoryRating}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.publishButton} onPress={publishReview}>
        <Text style={styles.publishButtonText}>Publish Review</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}