import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Dimensions, Animated, TouchableOpacity, Modal, Alert } from 'react-native';
import { Text, Card, useTheme, IconButton, Button } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getFoodItems } from '../../config';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {calculateStats} from '../utils/Stats'

const DashboardHeader = ({ navigation }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setShowDropdown(false)
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              // Clear all stored data
              await AsyncStorage.clear();
              // Navigate to login screen
              navigation.navigate('Login');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <Ionicons name="home" size={24} color="#fff" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>
      <TouchableOpacity 
        onPress={() => setShowDropdown(!showDropdown)}
        style={styles.profileButton}
      >
        <Ionicons name="person-circle-outline" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownContainer}>
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#ff4444" />
              <Text style={[styles.dropdownText, { color: '#ff4444' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

function DashboardScreen({ navigation }) {
    const [pantryData, setPantryData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const theme = useTheme();

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [])
    );

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const foodItems = await getFoodItems();
            
            if (foodItems) {
                setPantryData(foodItems);
            } else {
                throw new Error("Failed to fetch data");
            }
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            
            if (err.message.includes('401')) {
                setError("Please log in to view your pantry data");
            } else {
                setError("Failed to load dashboard data. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const stats = calculateStats(pantryData);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading dashboard data...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <Button 
                    mode="contained" 
                    onPress={fetchData}
                    style={styles.retryButton}
                >
                    Retry
                </Button>
                {error.includes("Please log in") && (
                    <Button 
                        mode="outlined" 
                        onPress={() => navigation.navigate('Login')}
                        style={styles.loginButton}
                    >
                        Go to Login
                    </Button>
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <DashboardHeader navigation={navigation} />
            <ScrollView style={styles.content}>
                <View style={styles.statsGrid}>
                    <Card style={[styles.statCard, styles.totalCard]}>
                        <Card.Content>
                            <View style={styles.statIconContainer}>
                                <IconButton
                                    icon="food-variant"
                                    size={24}
                                    iconColor="#fff"
                                    style={styles.statIcon}
                                />
                            </View>
                            <Text style={styles.statValue}>{stats.totalItems}</Text>
                            <Text style={styles.statLabel}>Total Items</Text>
                        </Card.Content>
                    </Card>

                    <Card style={[styles.statCard, stats.expiredItems > 0 ? styles.warningCard : styles.normalCard]}>
                        <Card.Content>
                            <View style={styles.statIconContainer}>
                                <IconButton
                                    icon="alert-circle"
                                    size={24}
                                    iconColor="#fff"
                                    style={styles.statIcon}
                                />
                            </View>
                            <Text style={styles.statValue}>{stats.expiredItems}</Text>
                            <Text style={styles.statLabel}>Expired</Text>
                        </Card.Content>
                    </Card>

                    <Card style={[styles.statCard, stats.soonToExpire > 0 ? styles.alertCard : styles.normalCard]}>
                        <Card.Content>
                            <View style={styles.statIconContainer}>
                                <IconButton
                                    icon="clock-alert"
                                    size={24}
                                    iconColor="#fff"
                                    style={styles.statIcon}
                                />
                            </View>
                            <Text style={styles.statValue}>{stats.soonToExpire}</Text>
                            <Text style={styles.statLabel}>Expiring Soon</Text>
                        </Card.Content>
                    </Card>
                </View>
            </ScrollView>
        </View>
    );
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 3; // 3 cards with padding

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    headerContainer: {
        backgroundColor: '#4c669f',
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
    content: {
        flex: 1,
        padding: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        width: cardWidth,
        borderRadius: 16,
        elevation: 4,
    },
    totalCard: {
        backgroundColor: '#4c669f',
    },
    normalCard: {
        backgroundColor: '#3b5998',
    },
    warningCard: {
        backgroundColor: '#ff4444',
    },
    alertCard: {
        backgroundColor: '#ffbb33',
    },
    statIconContainer: {
        marginBottom: 8,
    },
    statIcon: {
        margin: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#ff4444',
        textAlign: 'center',
        marginBottom: 8,
    },
    retryButton: {
        marginTop: 16,
    },
    loginButton: {
        marginTop: 16,
        marginLeft: 16,
    },
    profileButton: {
        padding: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    dropdownContainer: {
        position: 'absolute',
        top: 60,
        right: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        padding: 8,
        minWidth: 150,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    dropdownText: {
        marginLeft: 8,
        fontSize: 16,
    },
});

export default DashboardScreen;