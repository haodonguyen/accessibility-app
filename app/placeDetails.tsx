import React, { useState, useEffect } from 'react';
import { Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../FirebaseConfig';

export default function placeDetails() {
  const { id } = useLocalSearchParams(); 
  const [place, setPlace] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      if (typeof id === 'string') {
        try {
          const docRef = doc(db, 'places', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const placeData = docSnap.data();
            console.log('Fetched place details:', placeData); //debugging
            setPlace(placeData);
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

    fetchPlaceDetails();
  }, [id]);

  if (loading) {
    return (
    <Text>Loading...</Text>
    )
  }

  return (
    <ScrollView>
      <Text>===Place ID: {id || 'Data missing'}===</Text>
      <Text>Name: {place?.place_name || 'Data missing'}</Text>
      <Text>Description: {place?.place_description || 'Data missing'}</Text>
      <Text>Address: {place?.place_address || 'Data missing'}</Text>
      <Text>Phone: {place?.place_phonenumber || 'Data missing'}</Text>
      <Text>Submitted at: {place?.place_submission_timestamp ? new Date(place.place_submission_timestamp).toLocaleString() : 'Data missing'}
      </Text>

      <Text>===Disability Information===</Text>
      {/*convert the "true/false in the firestore to actual strings*/}
      <Text>Wheelchair Accessibility: {place?.wheelchair_accessible !== undefined ? (place.wheelchair_accessible ? 'Yes' : 'No') : 'Data missing'}</Text>
      <Text>Vision Accessibility: {place?.place_blind_accessible !== undefined ? (place.place_blind_accessible ? 'Yes' : 'No') : 'Data missing'}</Text>
      <Text>Hearing Accessibility: {place?.place_auditory_accessible !== undefined ? (place.place_auditory_accessible ? 'Yes' : 'No') : 'Data missing'}</Text>

      {place?.place_wheelchair_description && (
      <Text>Wheelchair Accessibility Description: {place.place_wheelchair_description}</Text>)}
      {place?.place_blind_description && (
      <Text>Vision Accessibility Description: {place.place_blind_description}</Text>)}
      {place?.place_auditory_description && (
      <Text>Hearing Accessibility Description: {place.place_auditory_description}</Text>)}
    </ScrollView>
  );
}