import React, { useState, useEffect } from 'react';
import { Text, ScrollView, Image, StyleSheet, View, Button, TextInput, Alert, Switch } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc, query, collection, where, getDocs, addDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { auth, db } from '../FirebaseConfig';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';

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
    <ScrollView>
    <Text>Write a Review</Text>

    
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text>Overall, do you recommend this place?</Text>
      <Switch value={recommended} onValueChange={setRecommended} />
    </View>
    <TextInput placeholder="Enter body text" value={reviewText} onChangeText={setReviewText}/>
    <TextInput placeholder="Wheelchair Accessibility Rating (1-5)" keyboardType="numeric" value={wheelchairRating} onChangeText={setWheelchairRating}/>
    <TextInput placeholder="Visual Accessibility Rating (1-5)" keyboardType="numeric" value={blindRating} onChangeText={setBlindRating}/>
    <TextInput placeholder="Auditory Accessibility Rating (1-5)" keyboardType="numeric" value={auditoryRating} onChangeText={setAuditoryRating}/>

    <Button title="Publish Review" onPress={publishReview} />
    </ScrollView>
  )

}