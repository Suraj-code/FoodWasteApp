import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import DashboardScreen from './src/Screens/DashboardScreen';
import AnalyticsScreen from './src/Screens/AnalyticsScreen';
import PantryScreen from "./src/Screens/PantryScreen";

type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Main: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Tab = createBottomTabNavigator();

const CustomHeader = () => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <Ionicons name="basket" size={24} color="#fff" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Pantry</Text>
      </View>
    </View>
  );
};

const BottomTabs = () => {
    return (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
            let iconName: string = 'help-circle-outline';
            if (route.name === 'Dashboard') iconName = 'home';
            else if (route.name === 'Analytics') iconName = 'bar-chart-outline';
            else if (route.name === 'Pantry') iconName = 'basket-outline';

            return <Ionicons name={iconName} size={size} color={color} />;
            },
        })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          headerShown: false
        }}
      />
      <Tab.Screen 
        name="Pantry" 
        component={PantryScreen} 
        options={{
          header: () => <CustomHeader />,
        }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen} 
        options={{
          headerShown: false
        }}
      />
    </Tab.Navigator>
    )
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#6B4F3C',
    height: 60,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    padding: 8,
  },
});

export default BottomTabs;