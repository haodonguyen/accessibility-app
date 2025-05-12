# MapApp

MapApp is a React Native application built with Expo that allows users to explore, submit, and view details about accessible places. The app integrates Firebase for authentication, Firestore for data storage, and Google Maps for geolocation and navigation.

## Features

- **User Authentication**: Sign up and log in using Firebase Authentication.
- **Map Integration**: View places on a map using `react-native-maps` and Google Maps API.
- **Search Functionality**: Search for places by name, description, or address.
- **Place Submission**: Submit new places with accessibility information and photos.
- **Place Details**: View detailed information about a place, including accessibility features and photos.
- **Navigation**: Get directions to a selected place using Google Maps Directions API.

## Project Structure


## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/mapApp.git
   cd mapApp
2. Install dependencies:
    ```bash
    npm install
    npm install react-native-maps-directions axios react-native-maps 
    npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
3. Set up Firebase:
    * Create a Firebase project in the Firebase Console.
    * Add a web app to your Firebase project and copy the configuration.
    * Replace the contents of FirebaseConfig.ts with your Firebase configuration.
4. Add your Google Maps API key:
5. Start the app:
    ```bash
    npx expo start

## Usage

- **Login**: Use the login screen to sign in or create an account.
- **Explore**: View places on the map and - search for specific locations.
- **Submit a Place**: Add a new place with accessibility information and photos.
- **View Details**: Click on a marker to view detailed information about a place.
- **Navigate**: Use the "Navigate Here" button to get directions to a place.

## Technologies Used
- **React Native**: Framework for building mobile apps.
- **Expo**: Development platform for React Native.
- **Firebase**: Authentication, Firestore, and Storage.
- **Google Maps API**: Geocoding and directions.
- **React Navigation**: Navigation and routing.
- **TypeScript**: Type-safe JavaScript.
