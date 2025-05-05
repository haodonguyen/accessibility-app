import React, { Component, useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, TextInput, Switch, ScrollView} from 'react-native'
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE, Marker } from 'react-native-maps'
import { auth, db, googlemapsAPIKey } from '../FirebaseConfig'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth, signOut } from 'firebase/auth'
import { router, useRouter } from 'expo-router'
import { collection, getDocs, addDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import axios from 'axios';
import AccessibilityInput from '../components/AccessibilityInput'; //ignore this error it is false
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


//a dedicated page to submit a new place, since i thought the modal overlay menu was too small and limiting
export default function submitPlace() {
  const [placeName, setPlaceName] = useState('')
  const [placeDescription, setPlaceDescription] = useState('')
  const [placePhoneNumber, setPlacePhoneNumber] = useState('')
  const [placeAddress, setPlaceAddress] = useState('')
  const [place_coordinates, setPlaceCoordinates] = useState({ latitude: 0, longitude: 0 });
  const [placeWheelchair, setPlaceWheelchair] = useState(false) //example accessibility information
  const [wheelchairDescription, setWheelchairDescription] = useState('')
  const [placeBlind, setPlaceBlind] = useState(false)
  const [blindDescription, setBlindDescription] = useState('')
  const [placeAuditory, setPlaceAuditory] = useState(false)
  const [auditoryDescription, setAuditoryDescription] = useState('')
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]); //store uri of selected photos so we can upload them to firestore later

const photoPicker = async () => { //todo: make this allow multiple selection
  try {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, //todo: fix the deprecation warning
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
    console.error("Error selecting photos:", error);
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
  };
}

const submitPlace = async () => {
    try {
        const docRef = await addDoc(collection(db, "places"), {
            place_name: placeName,
            place_description: placeDescription,
            place_phonenumber: placePhoneNumber,
            place_address: placeAddress,
            place_coordinates: place_coordinates,
            place_original_submitter_id: auth.currentUser?.uid, //get the current user id from firebaseauth
            place_owner_id: null, //this should be which business or account owns the venue and can edit it. if null, anybody shall be able to edit it.
            place_submission_timestamp: new Date().toISOString(),

            //accessibility:
            place_wheelchair_accessible: placeWheelchair, //does this place have access for wheelchairs and limited mobility?
            place_wheelchair_description: wheelchairDescription, //if yes, how? elevator? ramp?

            place_blind_accessible: placeBlind, //is this place accessible for blind & visually impaired?
            place_blind_description: blindDescription,

            place_auditory_accessible: placeAuditory, //is this place accessible for deaf & hearing impaired?
            place_auditory_description: auditoryDescription, 
        });
        const storage = getStorage();
        const uploadedPhotoURLs: string[] = [];
        let number = 1;
        for (const photo of selectedPhotos) {
            const response = await fetch(photo);
            const blob = await response.blob();
            //photo location convention is like this
            //  photos/place_id/1.jpg
            //we do dbinsertion first so we get the placeid
            //this will make it easier to find the photos later since theyre associated with the place id
            const storageRef = ref(storage, `photos/${docRef.id}/${number}`); 
            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);
            uploadedPhotoURLs.push(downloadURL);
            console.log(`Uploaded photo ${number} at URL ${downloadURL}! For place ID ${docRef.id} with name ${placeName}`);
            number++;
        };
        console.log("DB Insertion complete with ID: ", docRef.id);
        router.push('/');
    } catch (error:any) {
        console.error("DB Error: " + error);
    }
}

    useEffect(() => {
        if (place_coordinates.latitude && place_coordinates.longitude) {
            resolveAddress(); //resolve address whenever coordinates change
        }
    }, [place_coordinates]);

  return (
    <ScrollView style={{ flex: 1 }}>
      <Text>Submit a place</Text>
      <TextInput placeholder='Enter the venue name' value={placeName} onChangeText={setPlaceName} />
      <TextInput placeholder='Enter a description' value={placeDescription} onChangeText={setPlaceDescription} />
      <TextInput placeholder='Venue phone number' value={placePhoneNumber} onChangeText={setPlacePhoneNumber} keyboardType='numeric' />
      <TextInput placeholder='Move the map to select an address' value={placeAddress} editable={false} />
      <Text>(debug) coords: {place_coordinates.latitude}, {place_coordinates.longitude}</Text>
      <View style={{ height: 300, marginBottom: 20 }}>
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
        <View style={{ position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -10 }, { translateY: -10 }] }}>
          <Text style={{ fontWeight: 'bold', color: 'red', textAlign: 'center' }}>X</Text>
        </View>
      </View>

      <Button title='Select photos' onPress={photoPicker} />

      <Text>Disability information</Text>
      <AccessibilityInput
        label="Is this place suitable for users of wheelchairs?"
        switchValue={placeWheelchair}
        onSwitchChange={setPlaceWheelchair}
        description={wheelchairDescription}
        onDescriptionChange={setWheelchairDescription}
        placeholder="What is wheelchair access like at this place?"
        backgroundColor="lightcoral"
      />
      <AccessibilityInput
        label="Is this place suitable for people with visual impairments?"
        switchValue={placeBlind}
        onSwitchChange={setPlaceBlind}
        description={blindDescription}
        onDescriptionChange={setBlindDescription}
        placeholder="What is visual impairment access like at this place?"
        backgroundColor="lightblue"
      />
      <AccessibilityInput
        label="Is this place suitable for people with hearing impairments?"
        switchValue={placeAuditory}
        onSwitchChange={setPlaceAuditory}
        description={auditoryDescription}
        onDescriptionChange={setAuditoryDescription}
        placeholder="What is hearing impairment access like at this place?"
        backgroundColor="lightgreen"
      />

      <Button title='Submit' onPress={submitPlace} />
    </ScrollView>
  );
}