import React, { Component, useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, TextInput, Switch, ScrollView} from 'react-native'
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE, Marker } from 'react-native-maps'
import { auth, db, googlemapsAPIKey } from '../FirebaseConfig'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth, signOut } from 'firebase/auth'
import { useRouter } from 'expo-router'
import { collection, getDocs, addDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import axios from 'axios';
import AccessibilityInput from '../components/AccessibilityInput'; //ignore this error it is false


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

const dbInsert = async () => {
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
            console.log("DB Insertion complete with ID: ", docRef.id);
        } catch (error:any) {
            console.error("DB Error: " + error);
        }
    }

  return (
    <ScrollView style={{ flex: 1 }}>
      <Text>Submit a place</Text>
      <TextInput placeholder='Enter the venue name' value={placeName} onChangeText={setPlaceName} />
      <TextInput placeholder='Enter a description' value={placeDescription} onChangeText={setPlaceDescription} />
      <TextInput placeholder='Venue phone number' value={placePhoneNumber} onChangeText={setPlacePhoneNumber} keyboardType='numeric' />

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

      <Button title='Submit' onPress={dbInsert} />
    </ScrollView>
  );
}