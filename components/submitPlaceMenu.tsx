import React, { Component, useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, TextInput, Switch } from 'react-native'
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE, Marker } from 'react-native-maps'
import { auth, db, googlemapsAPIKey } from '../FirebaseConfig'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth, signOut } from 'firebase/auth'
import { useRouter } from 'expo-router'
import { collection, getDocs, addDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import axios from 'axios';

type Props = {
    place_coordinates: { latitude: number; longitude: number };
    onClose: () => void; //close menu in index
}

export default function SubmitPlaceMenu({ place_coordinates, onClose }: Props) { //a universal menu component we can use to submit a place and upload photos during creation
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

    //with geographical coordinates as input, use google API to resolve for address
    const resolveAddress = async () => {
        const { latitude, longitude } = place_coordinates;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googlemapsAPIKey}`;

        try {
            const response = await axios.get(url);
            const results = response.data.results;
            if (results.length > 0) {
                setPlaceAddress(results[0].formatted_address);
            } else {
                console.error('No address found for the given coordinates.');
            }
        } catch (error) {
            console.error('Error fetching address:', error);
        };
    }

    const dbInsert = async () => {
        try {
            const docRef = await addDoc(collection(db, "places"), {
                place_name: placeName,
                place_description: placeDescription,
                place_phonenumber: placePhoneNumber,
                place_address: placeAddress,
                place_coordinates: place_coordinates, //value comes from passed prop
                place_original_submitter_id: auth.currentUser?.uid, //get the current user id from firebaseauth
                place_owner_id: null, //this should be which business or account owns the venue and can edit it. if null, anybody shall be able to edit it.
                place_submission_timestamp: new Date().toISOString(),

                //accessibility:
                place_wheelchair_accessible: placeWheelchair, //does this place have access for wheelchairs and limited mobility?
                place_wheelchair_description: wheelchairDescription, //if yes, how? elevator? ramp?
                place_wheelchair_rating: null, //1-5 rating of wheelchair access. this is null upon submission, since rating is done by community and users later

                place_blind_accessible: placeBlind, //is this place accessible for blind & visually impaired?
                place_blind_description: blindDescription,
                place_blind_rating: null,

                place_auditory_accessible: placeAuditory, //is this place accessible for deaf & hearing impaired?
                place_auditory_description: auditoryDescription, 
                place_auditory_rating: null,
            });
            console.log("DB Insertion complete with ID: ", docRef.id);
            onClose(); // Close the modal after successful submission
        } catch (error:any) {
            console.error("DB Error: " + error);
        }
    }

    useEffect(() => {
        if (place_coordinates.latitude && place_coordinates.longitude) {
            resolveAddress(); //resolve address whenever coordinates change
        }
    }, [place_coordinates]);

    return (
        <View style={{ backgroundColor: 'white' }}>
            <Text>Submit a place</Text>
            <TextInput placeholder='Place name' value={placeName} onChangeText={setPlaceName} />
            <TextInput placeholder='Place description' value={placeDescription} onChangeText={setPlaceDescription} />
            <TextInput placeholder='Place phone number' value={placePhoneNumber} onChangeText={setPlacePhoneNumber} keyboardType='numeric' />
            <TextInput placeholder='Place address' value={placeAddress} onChangeText={setPlaceAddress} />
            <Text>(debug) coords: {place_coordinates.latitude}, {place_coordinates.longitude}</Text>
            <Text>(debug) autoresolved address: {placeAddress}</Text>
            <Button title='Submit' onPress={dbInsert} />
        </View>
    );
}