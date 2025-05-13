import React, { Component } from 'react'
import { Text, View } from 'react-native'
import { Stack } from 'expo-router'
const Page = () => {
    return (
      <Stack>
        <Stack.Screen name="login" options={{title: 'Login'}} />
        <Stack.Screen name="index" options={{title: 'Home'}} />
        <Stack.Screen name="submitPlace" options={{title: 'Submit a Place'}} />
        <Stack.Screen name="placeDetails" options={{title: 'Place Details'}} />
        <Stack.Screen name="writeReview" options={{title: 'Write a Review'}} />
        <Stack.Screen name="profileMenu" options={{title: 'Profile'}} />
      </Stack>
    )
  }
