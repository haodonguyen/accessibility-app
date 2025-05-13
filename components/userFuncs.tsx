import React, { useState, useEffect } from 'react';
import { Text, ScrollView, Image, StyleSheet, View, Button } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc, query, collection, where, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { auth, db, googlemapsAPIKey } from '../FirebaseConfig'
import { getStorage, ref, listAll, getDownloadURL, uploadBytes } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';


//i made this originally for the profile menu but I put it in its own file 
//so we can reuse it in other places e.g. getting user display names when displaying reviews
export const getProfileInformation = async (authID: string) => {
  if (!authID) return null;

  try {
    const userQuery = query(
      collection(db, 'users'),
      where('firebaseAuthID', '==', authID)
    );

    const querySnapshot = await getDocs(userQuery);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      //create a download URL based on the avatar path
      const storage = getStorage();
      const avatarURL = await getDownloadURL(ref(storage, userData.avatarPath));

      console.log('Retrieved profile information:', userData);
      return {
        profileID: userDoc.id,
        displayName: userData.displayName,
        avatarURL,
        descriptionText: userData.descriptionText,
      };
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }

  return null;
};

export const createDefaultProfile = async (authID: string) => {
  const defaultAvatarPath = 'avatars/default/default.jpg';

  try {
    const defaultProfile = {
      displayName: 'New User',
      firebaseAuthID: authID,
      avatarPath: defaultAvatarPath, //avatar path is a consistent reference
      descriptionText: 'No description provided.',
    };

    const docRef = await addDoc(collection(db, 'users'), defaultProfile);
    console.log('Default profile created with ID:', docRef.id);
    return;
  } catch (error) {
    console.error('Error creating default profile information:', error);
    throw error;
  }
};

export const changeDisplayName = async (newDisplayName: string, profileID: string) => {
  if (!newDisplayName || !profileID) {
    console.error('Invalid input: newDisplayName and profileID are both required.');
    return;
  }

  try {
    const userDocRef = doc(db, 'users', profileID);
    await updateDoc(userDocRef, { displayName: newDisplayName });
    console.log('Display name updated successfully.');
  } catch (error) {
    console.error('Error updating display name:', error);
    throw error;
  }
};

export const changeDescription = async (newDescription: string, profileID: string) => {
  if (!newDescription || !profileID) {
    console.error('Invalid input: newDescription and profileID are both required.');
    return;
  }

  try {
    const userDocRef = doc(db, 'users', profileID);
    await updateDoc(userDocRef, { descriptionText: newDescription });
    console.log('Description updated successfully.');
  } catch (error) {
    console.error('Error updating description:', error);
    throw error;
  }
};

export const changeAvatar = async (profileID: string) => {
  if (!profileID) {
    console.error('Invalid input: profileID is required.');
    return;
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], //always be square
      quality: 0.1,
    });

    if (result.canceled) {
      console.log('Image selection canceled.');
      return;
    }

    const imageUri = result.assets[0].uri;
    const storage = getStorage();
    const avatarPath = `avatars/${profileID}/${Date.now()}.jpg`;
    const storageRef = ref(storage, avatarPath);
    const response = await fetch(imageUri);
    const blob = await response.blob();
    await uploadBytes(storageRef, blob);
    console.log('Avatar uploaded successfully.');


    const userDocRef = doc(db, 'users', profileID);
    await updateDoc(userDocRef, { avatarPath });

    console.log('Avatar path updated successfully.');
  } catch (error) {
    console.error('Error changing avatar:', error);
    throw error;
  }
};