import React, { useState, useEffect } from 'react';
import { Text, ScrollView, Image, StyleSheet, View, Button } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { db } from '../FirebaseConfig';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';

export default function placeDetails() {
  const { id } = useLocalSearchParams(); 
  const [place, setPlace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [photoURLs, setPhotoURLs] = useState<string[]>([]);

  const router = useRouter();

  const startRouting = () => {
    console.log('Start routing to:', place?.place_coordinates);
    router.push(`/?latitude=${place.place_coordinates.latitude}&longitude=${place.place_coordinates.longitude}`);
  };

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

    const getPhotos = async () => {
      const storage = getStorage();
      try {
        const photosRef = ref(storage, `photos/${id}/`); //photos will always be here because thats how we upload them in submitplace menu
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

    fetchPlaceDetails();
    getPhotos();
  }, [id]);

  if (loading) {
    return (
    <Text>Loading...</Text>
    )
  }

  console.log('Photo URLs:', photoURLs);

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
      <Text>Wheelchair Accessibility: {place?.place_wheelchair_accessible !== undefined ? (place.place_wheelchair_accessible ? 'Yes' : 'No') : 'Data missing'}</Text>
      <Text>Vision Accessibility: {place?.place_blind_accessible !== undefined ? (place.place_blind_accessible ? 'Yes' : 'No') : 'Data missing'}</Text>
      <Text>Hearing Accessibility: {place?.place_auditory_accessible !== undefined ? (place.place_auditory_accessible ? 'Yes' : 'No') : 'Data missing'}</Text>

      {place?.place_wheelchair_description && (
        <Text>Wheelchair Accessibility Description: {place.place_wheelchair_description}</Text>)}
      {place?.place_blind_description && (
        <Text>Vision Accessility Description: {place.place_blind_description}</Text>)}
      {place?.place_auditordescription && (
        <Text>Hearing Accessibility Description: {place.place_auditory_description}</Text>)}

      <Text>===Photos===</Text>
      {photoURLs.length > 0 ? (
        <View style={styles.photoGrid}>
          {photoURLs.map((url, index) => (
            <Image key={index} source={{ uri: url }} style={styles.photo} />
          ))}
        </View>
      ) : (
        <Text>No photos (takes a few seconds to load. if this persists for more than 5 seconds, there's probably nothing)</Text>
      )}

      <Button title="Navigate Here" onPress={startRouting} />


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  photo: {
    width: 100,
    height: 100,
    marginVertical: 10,
    alignSelf: 'center',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});