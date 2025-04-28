import React, { Component, useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Modal } from 'react-native'
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE, Marker } from 'react-native-maps'
import { auth, db } from '../FirebaseConfig'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth, signOut } from 'firebase/auth'
import { useRouter } from 'expo-router'
import { collection, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import SubmitPlaceMenu from '../components/submitPlaceMenu';

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
  const [placeSubmissionModal, setIsSubmissionModalVisible] = useState(false);
  const [mapCenterCoordinates, setMapCenterCoordinates] = useState({ latitude: 0, longitude: 0 });

  //monitor auth state changes
  //if the user is not logged in, immediately punt them to redirect page
  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    retrievePlaces();
  }, []);

  const logOut = async () => {
    try {
      await signOut(auth);
      console.log("Logged out!");
    } catch (error) {
      console.error("Logout error: " + error);
    }
  };

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
          place_wheelchair_description: data.place_wheelchair_description || "missing wheelchair accessibility description",
          place_blind_accessible: data.place_blind_accessible || false,
          place_blind_description: data.place_blind_description || "missing blind accessibility description",
          place_auditory_accessible: data.place_auditory_accessible || false,
          place_auditory_description: data.place_auditory_description || "missing auditory accessibility description",
          place_submission_timestamp: data.place_submission_timestamp || "unknown submission time",
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
              {/*<Button title="(testing) Retrieve from firestore" onPress={retrievePlaces} />*/}
              <Button title="(testing) Logout" onPress={logOut} />
              {/*<Button title="(testing) Add place" onPress={() => setIsSubmissionModalVisible(true)} />*/}
              <Button title="(testing) Submit a place" onPress={() => router.push('/submitPlace')} />
          </View>
        
          <MapView style={StyleSheet.absoluteFill} provider={PROVIDER_DEFAULT} initialRegion={INITAL_REGION} onRegionChangeComplete={(region) => setMapCenterCoordinates(region)}>
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
          
          {/* aiming reticle */}
          {placeSubmissionModal && (
          <View style={{ position: "absolute", top: "50%", left: "50%", transform: [{ translateX: -10 }, { translateY: -10 }], zIndex: 10 }}>
          <Text>X</Text>
          </View>
          )}

          {placeSubmissionModal && (
    <View
        style={{position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'white', padding: 0, zIndex: 10,}}
    >
        <SubmitPlaceMenu place_coordinates={mapCenterCoordinates} onClose={() => setIsSubmissionModalVisible(false)} />
        <Button title="Close" onPress={() => setIsSubmissionModalVisible(false)} />
    </View>
      )
    }

      </View>
  );
}

