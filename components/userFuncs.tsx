import React, { useState, useEffect } from 'react';
import { Text, ScrollView, Image, StyleSheet, View, Button } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { auth, db, googlemapsAPIKey } from '../FirebaseConfig'
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';


//i made this originally for the profile menu but I put it in its own file 
//so we can reuse it in other places e.g. getting user display names when displaying reviews
export const getProfileInformation = async (authID: string) => {
  if (!authID) return null;

  try {
    const userQuery = query(
      collection(db, 'users'),
      where('firebaseAuthID', '==', authID) //query for user records where firebaseAuthID field matches provided auth ID
    );

    const querySnapshot = await getDocs(userQuery);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return {
        profileID: userDoc.id, //profile ID is only attached to profile picture, displayname, etc.
        displayName: userDoc.data().displayName,
      };
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }

  return null;
};