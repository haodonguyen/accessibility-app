import React, { useState, useEffect } from 'react';
import { Text, ScrollView, Image, StyleSheet, View, Button } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { auth, db, googlemapsAPIKey } from '../FirebaseConfig'
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { getProfileInformation } from '../components/userFuncs';

export default function profileMenu() {
  const [firebaseAuthID, setFirebaseAuthID] = useState('')
  const [profileID, setProfileID] = useState('')
  const [displayName, setDisplayName] = useState('')

  //initialise some information
  useEffect(() => {
    //retrieve profile information and initialise react state variables
    const fetchInfo = async () => {
      const authID = auth.currentUser?.uid || '';
      setFirebaseAuthID(authID);

      const profileData = await getProfileInformation(authID);
      if (profileData) {
        setProfileID(profileData.profileID);
        setDisplayName(profileData.displayName);
      }
    };

    fetchInfo();
  }, []);

  return (
    <ScrollView>
      <Text>===Profile Info===</Text>
      <Text>Display Name: {displayName}</Text>
      {/*on the final screen, the profile ID and auth ID can probably be minimalised or hidden entirely*/}
      <Text>Profile ID: {profileID}</Text>
      <Text>Firebase Authentication ID: {firebaseAuthID}</Text>


    </ScrollView>
  )

}