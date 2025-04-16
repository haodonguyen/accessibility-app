import React, { Component } from 'react'
import { Text, View, StyleSheet, Button } from 'react-native'
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps'
import { auth } from '../FirebaseConfig'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'expo-router'

const INITAL_REGION = {
  latitude: -37.8136,
  longitude: 144.9631,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function App() {
  const router = useRouter();
  return (
      <View style={{ flex: 1 }}>
          <View style={{ position: 'absolute', top: 50, left: 20, zIndex: 1 }}>
              <Button title="(testing) Go to Login" onPress={() => router.push('/login')} />
          </View>
          <MapView style={StyleSheet.absoluteFill} provider={PROVIDER_DEFAULT} initialRegion={INITAL_REGION} />
      </View>
  );
}
