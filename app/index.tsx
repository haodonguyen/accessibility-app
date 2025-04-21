import React, { Component } from 'react'
import { Text, View, StyleSheet, Button } from 'react-native'
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps'
import { auth } from '../FirebaseConfig'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'expo-router'
import { collection, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { db } from '../FirebaseConfig'; //db instance from firebase config.

const INITAL_REGION = {
  latitude: -37.8136,
  longitude: 144.9631,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

//EXPORT APP
export default function App() {
  const router = useRouter();
  const [places, setPlaces] = React.useState([]);

  const retrievePlaces = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "places"));
      const placesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); //mapping data to object array
      console.log("Places retrieved from the firestore DB:", placesData);
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };
  
  return (
      <View style={{ flex: 1 }}>
          <View style={{ position: 'absolute', top: 50, left: 20, zIndex: 1 }}>
              <Button title="(testing) Go to Login" onPress={() => router.push('/login')} />
              <Button title="(testing) Retrieve from firestore" onPress={retrievePlaces} />
          </View>
          <MapView style={StyleSheet.absoluteFill} provider={PROVIDER_DEFAULT} initialRegion={INITAL_REGION} />
      </View>
  );
}
