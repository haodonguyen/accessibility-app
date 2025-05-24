import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { auth } from '../FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { createDefaultProfile } from '../components/userFuncs';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    function errorMessage(error: any) {
        if (!error) return 'Unknown error!';
        if (error.message) {
            if (error.message.includes('auth/invalid-credential')) return 'Bad credentials.';
            if (error.message.includes('auth/email-already-in-use')) return 'Email already in use.';
        }
        return 'Failed to sign in. Please try again.';
    }
    const signIn = async () => {
        setError('');
        setSuccess('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (userCredential.user) {
                await createDefaultProfile(auth.currentUser?.uid);
                setSuccess('Successfully logged in!');
                setTimeout(() => router.push('/'), 1500);
            }
        } catch (error: any) {
            console.log('Sign-in error:', error.message);
            setError(errorMessage(error));
        }
    };

    const signUp = async () => {
        setError('');
        setSuccess('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (userCredential.user) {
                setSuccess('Account created successfully! Logging you in...');
                setTimeout(() => router.push('/'), 2000);
            }
        } catch (error: any) {
            console.log('Sign-up error:', error.message);
            setError(errorMessage(error));
        }
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <LinearGradient colors={['#f0f2f5', '#e1e6ed']} style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Text style={styles.title}>Welcome to Our App!</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />
                <View style={styles.passwordInputContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!isPasswordVisible}
                    />
                    <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                        <Text>{isPasswordVisible ? 'Hide' : 'Show'}</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button} onPress={signIn}>
                    <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={signUp}>
                    <Text style={styles.secondaryButtonText}>Create Account</Text>
                </TouchableOpacity>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                {success ? <Text style={styles.successText}>{success}</Text> : null}

                {/* For testing purposes, consider removing in production */}
                {__DEV__ && (
                    <TouchableOpacity style={styles.testButton} onPress={() => router.push('/')}>
                        <Text style={styles.testButtonText}>(Testing) Go to Home</Text>
                    </TouchableOpacity>
                )}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    inputContainer: {
        width: '100%',
        maxWidth: 350,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    passwordInput: {
        flex: 1,
        padding: 15,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 15,
        marginRight: 5,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#007bff',
    },
    secondaryButtonText: {
        color: '#007bff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        marginTop: 10,
    },
    successText: {
        color: 'green',
        marginTop: 10,
    },
    testButton: {
        backgroundColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    testButtonText: {
        color: '#333',
        fontSize: 14,
    },
});