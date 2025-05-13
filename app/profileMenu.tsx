import React, { useState, useEffect } from 'react';
import { Text, ScrollView, Image, StyleSheet, View, Button, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { auth, db, googlemapsAPIKey } from '../FirebaseConfig'
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { getProfileInformation, createDefaultProfile, changeDisplayName, changeDescription, changeAvatar } from '../components/userFuncs';

//we are currently assuming this is a profile menu for the currently logged-in user

export default function profileMenu() {
  const [firebaseAuthID, setFirebaseAuthID] = useState('')
  const [profileID, setProfileID] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [avatarURL, setAvatarURL] = useState('')
  const [descriptionText, setDescriptionText] = useState('')
  const [newDisplayName, setNewDisplayName] = useState('')
  const [newDescription, setNewDescription] = useState('')

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
        setAvatarURL(profileData.avatarURL);
        setDescriptionText(profileData.descriptionText);
      } else { //handle fringe case where account was created before the profile system was added
        await createDefaultProfile(authID);
        fetchInfo();
      }
    };

    fetchInfo();
  }, []);

  return (
    <ScrollView>
      <Text>===Profile Info===</Text>
      {avatarURL ? ( <Image source={{ uri: avatarURL }} style={{ width: 100, height: 100, borderRadius: 50 }}/>
      ) : (
        <Text>Loading profile picture...</Text>
      )}
      <Text>Display Name: {displayName || 'Fetching...' }</Text>
      <Text>Description: {descriptionText || 'Fetching...'}</Text>
      <Text>Profile ID: {profileID}</Text>
      <Text>Firebase Authentication ID: {firebaseAuthID}</Text>

      <Text>===(testing) Change Details===</Text>
      <Text>Note: maybe we could have a modal pop-up of some sort to do this</Text>
      <TextInput placeholder="Enter new profile name" value={newDisplayName} onChangeText={setNewDisplayName} />
      <TextInput placeholder="Enter new description text" value={newDescription} onChangeText={setNewDescription} />
      <Button title="Change name" onPress={() => changeDisplayName(newDisplayName, profileID)} />
      <Button title="Change description" onPress={() => changeDescription(newDescription, profileID)} />
      <Button title="Change Profile Picture" onPress={async () => {await changeAvatar(profileID);}} />
    </ScrollView>
  )

}