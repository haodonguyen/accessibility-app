import React, { Component } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps'

const INITAL_REGION = {
    latitude: -37.8136,
    longitude: 144.9631,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };
export default function App () {
    return (
      <View style={{flex: 1}}>
        <MapView style={StyleSheet.absoluteFill} provider={PROVIDER_DEFAULT} initialRegion={INITAL_REGION}/>
      </View>
    )
  }
