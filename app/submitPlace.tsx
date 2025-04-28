import React, { Component, useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, TextInput, Switch} from 'react-native'
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE, Marker } from 'react-native-maps'
import { auth, db, googlemapsAPIKey } from '../FirebaseConfig'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth, signOut } from 'firebase/auth'
import { useRouter } from 'expo-router'
import { collection, getDocs, addDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import axios from 'axios';


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

      <View style={{ marginBottom: 10, backgroundColor: 'lightblue', padding: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Switch value={placeWheelchair} onValueChange={setPlaceWheelchair} />
      <Text>Is this place suitable for users of wheelchairs?</Text>
      </View>
        <TextInput
        placeholder="What is wheelchair access like?"
        value={wheelchairDescription}
        onChangeText={setWheelchairDescription}
        multiline={true}
        style={{
        backgroundColor: 'white', padding: 10, borderRadius: 5, borderWidth: 1, borderColor: 'gray', marginTop: 10, width: '100%', height: 100, textAlignVertical: 'top',
        }}
        />
      </View>
    </View>
  );
}