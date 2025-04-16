import React, { Component } from 'react'
import { Text, View, StyleSheet, TextInput, Button } from 'react-native'
import { auth } from '../FirebaseConfig'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'expo-router'


//this is only a super simple login page for testing firebase connection!!!
//you can create an email/password combination with the button, and try login also
//if you have the wrong password: a warning pops up
//if you have the right password: you are sent back to the main page
export default function LoginPage() {
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const router = useRouter()

    const signIn = async () => {
        try {
          const user = await signInWithEmailAndPassword(auth, email, password)
          if (user) {router.push('/')}
        } catch (error:any) {
          console.error(error)
          alert('Signin failed: ' + error.message);
        };
    };

    const signUp = async () => {
      try {
        const user = await createUserWithEmailAndPassword(auth, email, password)
      } catch (error:any) {
        console.error(error)
        alert('Signin failed: ' + error.message);
      };
    };

    return (
        <View>
            <Text>A login page</Text>
            <View>
                <TextInput placeholder='email' value={email} onChangeText={setEmail} />
                <TextInput placeholder='password' value={password} onChangeText={setPassword} secureTextEntry={true} />
                <Button title='Sign In' onPress={signIn} />
                <Button title='Create Account' onPress={signUp} />
                <Button title="(testing) Go to Index" onPress={() => router.push('/')} />
            </View>
        </View>
    );
}