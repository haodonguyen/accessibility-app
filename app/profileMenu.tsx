import React, { useState, useEffect } from 'react';
import { Text, ScrollView, Image, StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../FirebaseConfig';
import { getProfileInformation, createDefaultProfile, changeDisplayName, changeDescription, changeAvatar } from '../components/userFuncs';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  profileInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#007bff',
  },
  loadingAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#777',
    fontStyle: 'italic',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#444',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Removed bottomBar and logoutButton styles
});

export default function ProfileMenu() {
  const [firebaseAuthID, setFirebaseAuthID] = useState('');
  const [profileID, setProfileID] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarURL, setAvatarURL] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchInfo = async () => {
      const authID = auth.currentUser?.uid || '';
      setFirebaseAuthID(authID);

      const profileData = await getProfileInformation(authID);
      if (profileData) {
        setProfileID(profileData.profileID);
        setDisplayName(profileData.displayName);
        setAvatarURL(profileData.avatarURL);
        setDescriptionText(profileData.descriptionText);
      } else {
        await createDefaultProfile(authID);
        fetchInfo();
      }
    };

    fetchInfo();
  }, []);

  const handleDisplayNameChange = () => {
    if (newDisplayName && profileID) {
      changeDisplayName(newDisplayName, profileID);
      setDisplayName(newDisplayName); // Update local state
      setNewDisplayName(''); // Clear input
    }
  };

  const handleDescriptionChange = () => {
    if (newDescription && profileID) {
      changeDescription(newDescription, profileID);
      setDescriptionText(newDescription); // Update local state
      setNewDescription(''); // Clear input
    }
  };

  const handleAvatarChange = async () => {
    if (profileID) {
      const newAvatarURL = await changeAvatar(profileID);
      if (newAvatarURL) {
        setAvatarURL(newAvatarURL); // Update local state
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Your Profile</Text>

      <View style={styles.profileInfoContainer}>
        {avatarURL ? (
          <Image source={{ uri: avatarURL }} style={styles.avatar} />
        ) : (
          <View style={styles.loadingAvatar}>
            <Text style={styles.loadingText}>Loading picture...</Text>
          </View>
        )}
        <Text style={styles.infoText}>Display Name: {displayName || 'Fetching...'}</Text>
        <Text style={styles.infoText}>Description: {descriptionText || 'Fetching...'}</Text>
        {/* <Text style={styles.infoText}>Profile ID: {profileID}</Text>
        <Text style={styles.infoText}>Firebase ID: {firebaseAuthID}</Text> */}
      </View>

      <Text style={styles.sectionTitle}>Change Display Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new display name"
        value={newDisplayName}
        onChangeText={setNewDisplayName}
      />
      <TouchableOpacity style={styles.button} onPress={handleDisplayNameChange}>
        <Text style={styles.buttonText}>Update Name</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Change Description</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new description"
        value={newDescription}
        onChangeText={setNewDescription}
        multiline
        numberOfLines={3}
      />
      <TouchableOpacity style={styles.button} onPress={handleDescriptionChange}>
        <Text style={styles.buttonText}>Update Description</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Change Profile Picture</Text>
      <TouchableOpacity style={styles.button} onPress={handleAvatarChange}>
        <Text style={styles.buttonText}>Change Avatar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}