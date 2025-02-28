import React from 'react';
import { View, Text, StyleSheet, StatusBar, useColorScheme } from 'react-native';
import WelcomeScreen from './Screens/WelcomeScreen';

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <WelcomeScreen />
  );
}


