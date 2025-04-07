import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { Text, Card, useTheme, IconButton, Button } from 'react-native-paper';
import { getFoodItems } from '../../config';
import { getCategoryNames } from '../../config';
import { useFocusEffect } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';

function DashboardScreen({ navigation }) {
    const [pantryData, setPantryData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const theme = useTheme(); //useTheme is used to get the theme of the app

    useFocusEffect(
        React.useCallback(() => { //useCallback is used to prevent the function from being recreated on every render, optimizing performance
            fetchData();
        }, [])
    );

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const foodItems = await getFoodItems();
            const categoryData = await getCategoryNames();
            
            if (foodItems && categoryData) {
                setPantryData(foodItems);
                setCategories(categoryData);
            } else {
                throw new Error("Failed to fetch data");
            }
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            
            // Handle authentication errors
            if (err.message.includes('401')) {
                setError("Please log in to view your pantry data");
                // Usually means the token has expired, so we need to log in again
                // Optionally navigate to login screen
                // navigation.navigate('Login');
            } else {
                setError("Failed to load dashboard data. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = () => {
        const today = new Date();
        const soonToExpireDate = new Date();
        soonToExpireDate.setDate(today.getDate() + 7);

        const stats = {
            totalItems: pantryData.length,
            expiredItems: 0,
            soonToExpire: 0,
            categoryCounts: {},
            totalValue: 0
        };

        pantryData.forEach(item => {
            const expiryDate = new Date(item.expiration_date);
            const purchaseDate = new Date(item.purchase_date);
            
            if (expiryDate < today) {
                stats.expiredItems++;
            }
            
            if (expiryDate > today && expiryDate <= soonToExpireDate) {
                stats.soonToExpire++;
            }

            const categoryName = categories.find(cat => cat.category_id === item.category_id)?.name || 'Uncategorized';
            stats.categoryCounts[categoryName] = (stats.categoryCounts[categoryName] || 0) + 1;

            stats.totalValue += item.quantity || 0;
        });

        return stats;
    };

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

    const stats = calculateStats();

    return (
        <ScrollView style={styles.container}>
            {/* Modern Header */}
            {/* <LinearGradient
                colors={['#4c669f', '#3b5998', '#192f6a']}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Pantry Overview</Text>
                <Text style={styles.headerSubtitle}>Your food inventory at a glance</Text>
            </LinearGradient> */}

            <View style={styles.content}>
                {/* Stats Grid */}
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

                {/* Category Breakdown */}
                <Card style={styles.categoryCard}>
                    <Card.Content>
                        <View style={styles.categoryHeader}>
                            <IconButton
                                icon="format-list-bulleted"
                                size={24}
                                iconColor="#4c669f"
                            />
                            <Text style={styles.categoryTitle}>Category Breakdown</Text>
                        </View>
                        {Object.entries(stats.categoryCounts).map(([category, count]) => (
                            <View key={category} style={styles.categoryRow}>
                                <View style={styles.categoryInfo}>
                                    <View style={styles.categoryDot} />
                                    <Text style={styles.categoryName}>{category}</Text>
                                </View>
                                <Text style={styles.categoryCount}>{count}</Text>
                            </View>
                        ))}
                    </Card.Content>
                </Card>
            </View>
        </ScrollView>
    );
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 3; // 3 cards with padding

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 24,
        paddingTop: 48,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    content: {
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    categoryCard: {
        borderRadius: 16,
        elevation: 4,
        marginBottom: 16,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4c669f',
        marginRight: 8,
    },
    categoryName: {
        fontSize: 14,
        color: '#666',
    },
    categoryCount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
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
});

export default DashboardScreen;