import React, { Component, useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, TextInput } from 'react-native'
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE, Marker } from 'react-native-maps'
import { auth } from '../FirebaseConfig'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth, signOut } from 'firebase/auth'
import { useRouter } from 'expo-router'
import { collection, getDocs, addDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { db } from '../FirebaseConfig'; //db instance from firebase config.

//todo: coordinate input. im thinking some kind of aiming reticle centered on the map that is used to select coordinates
export default function submitPlaceMenu() { //a universal menu component we can use to submit a place and upload photos during creation
    const [placeName, setPlaceName] = useState('')
    const [placeDescription, setPlaceDescription] = useState('')
    const [placePhoneNumber, setPlacePhoneNumber] = useState('')
    const [placeAddress, setPlaceAddress] = useState('')
    const [placeCoordinates, setPlaceCoordinates] = useState({ latitude: 0, longitude: 0 })//dont allow manually inputting!!!
    const [placeWheelchair, setPlaceWheelchair] = useState(false) //example accessibility information

    const dbInsert = async () => {
        try {
            const docRef = await addDoc(collection(db, "places"), {
                place_name: placeName,
                place_description: placeDescription,
                place_phonenumber: placePhoneNumber,
                place_address: placeAddress,
                place_coordinates: placeCoordinates,
                place_owner_id: auth.currentUser?.uid, //get the current user id from firebase auth
                place_wheelchair_accessible: placeWheelchair
            });
            console.log("DB Insertion complete with ID: ", docRef.id);
        } catch (error:any) {
            console.error("DB Error: " + error);
        }
    }

    //return menu
    return (
        <View style={{ backgroundColor: 'white' }}>
            <Text>Submit a place</Text>
            <TextInput placeholder='Place name' value={placeName} onChangeText={setPlaceName} />
            <TextInput placeholder='Place description' value={placeDescription} onChangeText={setPlaceDescription} />
            <TextInput placeholder='Place phone number' value={placePhoneNumber} onChangeText={setPlacePhoneNumber} keyboardType='numeric' />
            <TextInput placeholder='Place address' value={placeAddress} onChangeText={setPlaceAddress} />
            <Button title='Submit' onPress={dbInsert} />
        </View>
    );
}