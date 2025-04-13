import React, { Component } from 'react'
import { Text, View } from 'react-native'
import { Stack } from 'expo-router'
const Page = () => {
    return (
      <Stack>
        <Stack.Screen name="index" options={{title: 'Home'}} />
      </Stack>
    )
  }
