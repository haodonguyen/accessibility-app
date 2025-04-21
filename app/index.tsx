import React, { Component, useState } from 'react'
import { Text, View, StyleSheet, Button } from 'react-native'
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE, Marker } from 'react-native-maps'
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

type Place = {
  id: string;
  place_name: string;
  place_description: string;
  place_phonenumber: number;
  place_address: string;
  place_coordinates: {
    latitude: any;
    longitude: any;
  };
  place_owner_id: string;
  place_wheelchair_accessible: boolean;
}

//EXPORT APP
export default function App() {
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);

  const retrievePlaces = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "places"));
      const placesData: Place[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { //same mapping as before but properly typed for react usestate
          //note: the values after '||' are default values if the associated data is missing from firestore.
          id: doc.id,
          place_name: data.place_name || "Missing name",
          place_description: data.place_description || "missing description",
          place_phonenumber: data.place_phonenumber || "0000000000",
          place_address: data.place_address || "missing address",
          place_coordinates: {
            latitude: data.place_coordinates.latitude,
            longitude: data.place_coordinates.longitude,
          },
          place_owner_id: data.place_owner_id || "missing owner id",
          place_wheelchair_accessible: data.place_wheelchair_accessible || false,
        };
      });
      console.log("Places retrieved from the Firestore DB:", placesData);
      setPlaces(placesData);
    } catch (error) {
      alert("Failed to retrieve places.");
      console.error("Error fetching places:", error);
    }
  };
  
  return (
      <View style={{ flex: 1 }}>
          <View style={{ position: 'absolute', top: 50, left: 20, zIndex: 1 }}>
              <Button title="(testing) Go to Login" onPress={() => router.push('/login')} />
              <Button title="(testing) Retrieve from firestore" onPress={retrievePlaces} />
          </View>
        
          <MapView style={StyleSheet.absoluteFill} provider={PROVIDER_DEFAULT} initialRegion={INITAL_REGION}>
            {places.map(place => (

              <Marker //place markers with the data from firestore
                key={place.id}
                coordinate={{
                  latitude: place.place_coordinates.latitude,
                  longitude: place.place_coordinates.longitude,
                }}
                title={place.place_name}
                description={place.place_description}

              />
            ))}
          </MapView>
      </View>
  );
}
