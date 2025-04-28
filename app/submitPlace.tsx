import React, { Component, useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, TextInput, Switch} from 'react-native'
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
  const [placeWheelchair, setPlaceWheelchair] = useState(false) //example accessibility information
  const [wheelchairDescription, setWheelchairDescription] = useState('')
  const [placeBlind, setPlaceBlind] = useState(false)
  const [blindDescription, setBlindDescription] = useState('')
  const [placeAuditory, setPlaceAuditory] = useState(false)
  const [auditoryDescription, setAuditoryDescription] = useState('')


  return (
    <View>
      <Text>Submit a place</Text>
      <TextInput placeholder='Place name' value={placeName} onChangeText={setPlaceName} />
      <TextInput placeholder='Place description' value={placeDescription} onChangeText={setPlaceDescription} />
      <TextInput placeholder='Place phone number' value={placePhoneNumber} onChangeText={setPlacePhoneNumber} keyboardType='numeric' />
      <TextInput placeholder='Place address' value={placeAddress} onChangeText={setPlaceAddress} />

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
            
    </View>
  );
}