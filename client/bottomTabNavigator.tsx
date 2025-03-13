import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';

import DashboardScreen from './src/Screens/DashboardScreen';
import AnalyticsScreen from './src/Screens/AnalyticsScreen';
import PantryScreen from "./src/Screens/PantryScreen";

const Tab = createBottomTabNavigator();

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
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{headerTitle: 'Dashboard'}}/>
      <Tab.Screen name="Pantry" component={PantryScreen} options={{headerTitle: 'Pantry'}}/>
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{headerTitle: 'Analytics'}}/>
    </Tab.Navigator>
    )
}

export default BottomTabs;