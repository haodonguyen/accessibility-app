import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, TextInput, Switch, ScrollView, TouchableOpacity, Image } from 'react-native';
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { auth, db, googlemapsAPIKey } from '../FirebaseConfig';
import { router, useRouter } from 'expo-router';
import { collection, addDoc } from 'firebase/firestore';
import axios from 'axios';
import AccessibilityInput from '../components/AccessibilityInput'; //ignore this error it is false
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome for icons

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  mapContainer: {
    height: 300,
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  mapMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -24 }], // Adjust for marker size
  },
  markerIcon: {
    fontWeight: 'bold',
    color: '#ff6347', // Tomato color
    fontSize: 24,
    textAlign: 'center',
  },
  addressText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#555',
  },
  photoPickerButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  photoPickerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedPhotosContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    overflow: 'scroll',
  },
  selectedPhoto: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 5,
  },
  accessibilitySection: {
    marginBottom: 20,
  },
  accessibilityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default function submitPlace() {
  const [placeName, setPlaceName] = useState('');
  const [placeDescription, setPlaceDescription] = useState('');
  const [placePhoneNumber, setPlacePhoneNumber] = useState('');
  const [placeAddress, setPlaceAddress] = useState('');
  const [place_coordinates, setPlaceCoordinates] = useState({ latitude: 0, longitude: 0 });
  const [placeWheelchair, setPlaceWheelchair] = useState(false);
  const [wheelchairDescription, setWheelchairDescription] = useState('');
  const [placeBlind, setPlaceBlind] = useState(false);
  const [blindDescription, setBlindDescription] = useState('');
  const [placeAuditory, setPlaceAuditory] = useState(false);
  const [auditoryDescription, setAuditoryDescription] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const router = useRouter();

  const photoPicker = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        setSelectedPhotos((prevPhotos) => [
          ...prevPhotos,
          ...result.assets.map((asset) => asset.uri),
        ]);
      }
    } catch (error) {
      console.error('Error selecting photos:', error);
    }
  };

  const resolveAddress = async () => {
    const { latitude, longitude } = place_coordinates;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googlemapsAPIKey}`;

    try {
      const response = await axios.get(url);
      const results = response.data.results;
      if (results.length > 0) {
        setPlaceAddress(results[0].formatted_address);
      } else {
        console.error('No address found for the given coordinates.');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const submitPlace = async () => {
    try {
      const docRef = await addDoc(collection(db, 'places'), {
        place_name: placeName,
        place_description: placeDescription,
        place_phonenumber: placePhoneNumber,
        place_address: placeAddress,
        place_coordinates: place_coordinates,
        place_original_submitter_id: auth.currentUser?.uid,
        place_owner_id: null,
        place_submission_timestamp: new Date().toISOString(),
        place_wheelchair_accessible: placeWheelchair,
        place_wheelchair_description: wheelchairDescription,
        place_blind_accessible: placeBlind,
        place_blind_description: blindDescription,
        place_auditory_accessible: placeAuditory,
        place_auditory_description: auditoryDescription,
      });
      const storage = getStorage();
      for (let i = 0; i < selectedPhotos.length; i++) {
        const photo = selectedPhotos[i];
        const response = await fetch(photo);
        const blob = await response.blob();
        const storageRef = ref(storage, `photos/${docRef.id}/${i + 1}`);
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        console.log(`Uploaded photo ${i + 1} at URL ${downloadURL}! For place ID ${docRef.id} with name ${placeName}`);
      }
      console.log('DB Insertion complete with ID: ', docRef.id);
      router.push('/');
    } catch (error: any) {
      console.error('DB Error: ' + error);
    }
  };

  useEffect(() => {
    if (place_coordinates.latitude && place_coordinates.longitude) {
      resolveAddress(); //resolve address whenever coordinates change
    }
  }, [place_coordinates]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Submit a Place</Text>
      <Text style={styles.label}>Venue Name:</Text>
      <TextInput style={styles.input} placeholder="Enter the venue name" value={placeName} onChangeText={setPlaceName} />
      <Text style={styles.label}>Description:</Text>
      <TextInput style={styles.input} placeholder="Enter a description" value={placeDescription} onChangeText={setPlaceDescription} multiline numberOfLines={3} />
      <Text style={styles.label}>Phone Number:</Text>
      <TextInput style={styles.input} placeholder="Venue phone number" value={placePhoneNumber} onChangeText={setPlacePhoneNumber} keyboardType="numeric" />
      <Text style={styles.label}>Select Location:</Text>
      <View style={styles.mapContainer}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: -37.8136,
            longitude: 144.9631,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onRegionChangeComplete={(region) => setPlaceCoordinates({ latitude: region.latitude, longitude: region.longitude })}
        />
        <View style={styles.mapMarker}>
          <Text style={styles.markerIcon}>📍</Text>
        </View>
      </View>
      <Text style={styles.label}>Address:</Text>
      <Text style={styles.addressText}>{placeAddress || 'Move the map to select an address'}</Text>

      <TouchableOpacity style={styles.photoPickerButton} onPress={photoPicker}>
        <Text style={styles.photoPickerButtonText}>Select Photos</Text>
      </TouchableOpacity>
      {selectedPhotos.length > 0 && (
        <ScrollView style={styles.selectedPhotosContainer} horizontal>
          {selectedPhotos.map((uri) => (
            <Image key={uri} source={{ uri }} style={styles.selectedPhoto} />
          ))}
        </ScrollView>
      )}

      <View style={styles.accessibilitySection}>
        <Text style={styles.accessibilityTitle}>Accessibility Information</Text>
        <AccessibilityInput
          label="Wheelchair Accessibility:"
          switchValue={placeWheelchair}
          onSwitchChange={setPlaceWheelchair}
          description={wheelchairDescription}
          onDescriptionChange={setWheelchairDescription}
          placeholder="Details about wheelchair access"
          backgroundColor="#f0f8ff" // AliceBlue
        />
        <AccessibilityInput
          label="Visual Accessibility:"
          switchValue={placeBlind}
          onSwitchChange={setPlaceBlind}
          description={blindDescription}
          onDescriptionChange={setBlindDescription}
          placeholder="Details about visual impairment access"
          backgroundColor="#e0ffff" // Cyan
        />
        <AccessibilityInput
          label="Hearing Accessibility:"
          switchValue={placeAuditory}
          onSwitchChange={setPlaceAuditory}
          description={auditoryDescription}
          onDescriptionChange={setAuditoryDescription}
          placeholder="Details about hearing impairment access"
          backgroundColor="#f0fff0" // Honeydew
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={submitPlace}>
        <Text style={styles.submitButtonText}>Submit Place</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}