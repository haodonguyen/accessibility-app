import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import { auth, db, googlemapsAPIKey } from '../FirebaseConfig';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import * as Expo_location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';
import SubmitPlaceMenu from '../components/submitPlaceMenu';
import SearchBar from './searchBar'; // Import the SearchBar component
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome for the icon

const INITAL_REGION = {
    latitude: -37.8136,
    longitude: 144.9631,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

type Place = {
    id: string;
    place_name: string;
    place_description: string;
    place_phonenumber: number;
    place_address: string;
    place_coordinates: {
        latitude: any;
        longitude: any;
    };
    place_owner_id: string;
    place_wheelchair_accessible: boolean;
    place_wheelchair_description?: string;
    place_blind_accessible?: boolean;
    place_blind_description?: string;
    place_auditory_accessible?: boolean;
    place_auditory_description?: string;
    place_submission_timestamp?: string;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    searchBarContainer: {
        position: 'absolute',
        top: 30,
        left: 0,
        right: 0,
        zIndex: 2,
        paddingHorizontal: 10,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 3,
    },
    bottomBarButton: {
        alignItems: 'center',
    },
    bottomBarIcon: {
        fontSize: 24,
        color: '#555',
        marginBottom: 5,
    },
    bottomBarText: {
        fontSize: 12,
        color: '#555',
    },
    logoutButton: {
        backgroundColor: '#f44336',
        borderRadius: 5,
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutIcon: {
        marginRight: 5,
        fontSize: 18,
        color: 'white',
    },
    logoutText: {
        color: 'white',
        fontSize: 14,
    },
    stopRoutingButton: {
        backgroundColor: '#007bff',
        borderRadius: 5,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    stopRoutingText: {
        color: 'white',
        fontSize: 14,
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    closeButton: {
        marginTop: 15,
        alignSelf: 'flex-end',
    },
});

export default function App() {
    const router = useRouter();
    const [allPlaces, setAllPlaces] = useState<Place[]>([]); // Store all places fetched from Firestore
    const [places, setPlaces] = useState<Place[]>([]); // Store the filtered places to display on the map
    const [placeSubmissionModal, setIsSubmissionModalVisible] = useState(false);
    const [mapCenterCoordinates, setMapCenterCoordinates] = useState({ latitude: 0, longitude: 0 });
    const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [destinationCoordinates, setDestinationCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

    const searchParams = useLocalSearchParams();

    useEffect(() => { //get coordinates for our target from url parameters (they only exist when passed from placeDetails.tsx if you click "navigate here")
        const latitude = searchParams.latitude;
        const longitude = searchParams.longitude;

        if (
            latitude && longitude &&
            (!destinationCoordinates ||
                destinationCoordinates.latitude !== parseFloat(latitude as string) ||
                destinationCoordinates.longitude !== parseFloat(longitude as string))
        ) {
            setDestinationCoordinates({
                latitude: parseFloat(latitude as string),
                longitude: parseFloat(longitude as string),
            });
        }
    }, [searchParams, destinationCoordinates]);

    useEffect(() => {
        const unsubscribe = getAuth().onAuthStateChanged((user) => {
            if (!user) {
                router.push('/login');
            }
        });
        return () => unsubscribe();
    }, [router]);

    useEffect(() => {
        retrievePlaces();
    }, []);

    useEffect(() => {
        let locationSubscription: Expo_location.LocationSubscription | null = null;

        const startLocationUpdates = async () => {
            try {
                const { status } = await Expo_location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    alert('User denied location permissions');
                    return;
                }
                locationSubscription = await Expo_location.watchPositionAsync(
                    {
                        accuracy: Expo_location.Accuracy.High,
                        timeInterval: 5000, //every 5 seconds
                        distanceInterval: 10, //only every 10 meters, neccessary to stop the directions route from constantly re-rendering
                    },
                    (location) => {
                        console.log('Updated location:', location);
                        setCurrentLocation({
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        });
                    }
                );
            } catch (error) {
                console.error('Location Error:', error);
            }
        };

        startLocationUpdates();
        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    },
        []);

    const logOut = async () => {
        try {
            await signOut(auth);
            console.log('Logged out!');
        } catch (error) {
            console.error('Logout error: ' + error);
        }
    };

    const retrievePlaces = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'places'));
            const placesData: Place[] = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    place_name: data.place_name || 'Missing name',
                    place_description: data.place_description || 'missing description',
                    place_phonenumber: data.place_phonenumber || '0000000000',
                    place_address: data.place_address || 'missing address',
                    place_coordinates: {
                        latitude: data.place_coordinates?.latitude,
                        longitude: data.place_coordinates?.longitude,
                    },
                    place_owner_id: data.place_owner_id || 'missing owner id',
                    place_wheelchair_accessible: data.place_wheelchair_accessible || false,
                    place_wheelchair_description: data.place_wheelchair_description || 'missing wheelchair accessibility description',
                    place_blind_accessible: data.place_blind_accessible || false,
                    place_blind_description: data.place_blind_description || 'missing blind accessibility description',
                    place_auditory_accessible: data.place_auditory_accessible || false,
                    place_auditory_description: data.place_auditory_description || 'missing auditory accessibility description',
                    place_submission_timestamp: data.place_submission_timestamp || 'unknown submission time',
                } as Place; // Type assertion
            });
            console.log(`Fetched ${placesData.length} total places.`);
            setAllPlaces(placesData);
            setPlaces(placesData); // Initially, display all places
        } catch (error) {
            alert('Failed to retrieve places.');
            console.error('Error fetching places:', error);
        }
    };

    const handleSearch = (searchText: string) => {
        const filteredPlaces = allPlaces.filter((place) =>
            place.place_name.toLowerCase().includes(searchText.toLowerCase()) ||
            place.place_description.toLowerCase().includes(searchText.toLowerCase()) ||
            place.place_address.toLowerCase().includes(searchText.toLowerCase())
        );
        setPlaces(filteredPlaces);
    };

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchBarContainer}>
                <SearchBar onSearch={handleSearch} />
            </View>

            <MapView
                style={styles.map}
                provider={PROVIDER_DEFAULT}
                initialRegion={INITAL_REGION}
                onRegionChangeComplete={(region) => setMapCenterCoordinates(region)}
            >
                {places.map((place) => (
                    <Marker
                        key={place.id}
                        coordinate={{
                            latitude: place.place_coordinates.latitude,
                            longitude: place.place_coordinates.longitude,
                        }}
                        title={place.place_name}
                        description={place.place_description}
                        onPress={() => router.push(`/placeDetails?id=${place.id}`)} // Pass the place ID as a query parameter
                    />
                ))}

                {currentLocation && destinationCoordinates && ( //if we have both states, render the MapViewDirections component
                    <MapViewDirections
                        origin={currentLocation} //should be the current location of the user
                        destination={destinationCoordinates}
                        apikey={googlemapsAPIKey} //from firebaseconfig.tsx
                        strokeWidth={5}
                        strokeColor="red"
                    />
                )}

            </MapView>

            {/* Bottom Button Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.bottomBarButton}
                    onPress={() => router.push('/submitPlace')} // Navigate to submit place screen
                >
                    <FontAwesome name="plus-circle" size={24} color="#007bff" style={styles.bottomBarIcon} />
                    <Text style={styles.bottomBarText}>Add Place</Text>
                </TouchableOpacity>

                {destinationCoordinates && (
                    <TouchableOpacity
                        style={styles.bottomBarButton}
                        onPress={() => {
                            setDestinationCoordinates(null);
                            router.replace('/');
                        }}
                    >
                        <FontAwesome name="stop-circle" size={24} color="#ff9800" style={styles.bottomBarIcon} />
                        <Text style={styles.bottomBarText}>Stop Route</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.bottomBarButton} onPress={() => router.push('/profileMenu')}>
                    <FontAwesome name="camera" size={24} color="#f44336" style={styles.bottomBarIcon} />
                    <Text style={styles.bottomBarText}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.bottomBarButton} onPress={logOut}>
                    <FontAwesome name="sign-out" size={24} color="#f44336" style={styles.bottomBarIcon} />
                    <Text style={styles.bottomBarText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}