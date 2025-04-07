import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Card, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

function LoginScreen(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const handleEmailChange = (text) => {
        setEmail(text);
        if (text && !validateEmail(text)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
    };

    const handlePasswordChange = (text) => {
        setPassword(text);
        if (text && !validatePassword(text)) {
            setPasswordError('Password must be at least 6 characters');
        } else {
            setPasswordError('');
        }
    };

    const handleLogin = async () => {
        // Reset errors
        setEmailError('');
        setPasswordError('');

        // Validate inputs
        if (!email) {
            setEmailError('Email is required');
            return;
        }
        if (!password) {
            setPasswordError('Password is required');
            return;
        }
        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }
        if (!validatePassword(password)) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('http://10.0.2.2:5000/login', {
                email,
                password
            });

            if (response.status === 200) {
                console.log('Response Data:', response.data);
                const authToken = response.data.access_token;
                await AsyncStorage.setItem('token', authToken);
                navigation.navigate('Main');
            }
        } catch (error) {
            if (error.response) {
                console.log('Response error:', error.response);
                if (error.response.status === 401) {
                    Alert.alert('Error', 'Invalid email or password');
                } else {
                    Alert.alert(`Error: ${error.response.data.message || error.response.statusText}`);
                }
            } else if (error.request) {
                console.log('Request error:', error.request);
                Alert.alert('Error', 'No response received from server. Please check your connection.');
            } else {
                console.log('Error message:', error.message);
                Alert.alert('Error', 'An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <Text style={styles.appTitle}>Food Waste App</Text>
                <Text style={styles.tagline}>Reduce Waste, Save Resources</Text>
            </View>

            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>

                    <View style={[styles.inputContainer, emailError ? styles.inputError : null]}>
                        <TextInput
                            placeholder='Email'
                            value={email}
                            onChangeText={handleEmailChange}
                            style={styles.txtInput}
                            placeholderTextColor="#999"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />
                    </View>
                    {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                    <View style={[styles.inputContainer, passwordError ? styles.inputError : null]}>
                        <TextInput
                            secureTextEntry={!isPasswordVisible}
                            placeholder='Password'
                            value={password}
                            onChangeText={handlePasswordChange}
                            style={styles.txtInput}
                            placeholderTextColor="#999"
                            autoComplete="password"
                        />
                        <TouchableOpacity 
                            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                            style={styles.eyeButton}
                        >
                            <Text style={styles.eyeButtonText}>
                                {isPasswordVisible ? 'Hide' : 'Show'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                    <TouchableOpacity 
                        style={[styles.btnStyle, isLoading ? styles.btnDisabled : null]} 
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        <Text style={styles.btnText}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.signupContainer}
                        onPress={() => navigation.navigate('Signup')}
                    >
                        <Text style={styles.signupText}>Don't have an account? </Text>
                        <Text style={styles.signupLink}>Sign up</Text>
                    </TouchableOpacity>
                </Card.Content>
            </Card>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    appTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4c669f',
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    card: {
        borderRadius: 20,
        elevation: 8,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        marginBottom: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    inputError: {
        borderColor: '#ff4444',
    },
    txtInput: {
        flex: 1,
        padding: 15,
        fontSize: 16,
        color: '#333',
    },
    errorText: {
        color: '#ff4444',
        fontSize: 12,
        marginBottom: 10,
        marginLeft: 5,
    },
    eyeButton: {
        padding: 12,
        marginRight: 5,
    },
    eyeButtonText: {
        color: '#4c669f',
        fontSize: 14,
        fontWeight: '500',
    },
    btnStyle: {
        backgroundColor: '#4c669f',
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    btnDisabled: {
        backgroundColor: '#a0a0a0',
    },
    btnText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 25,
    },
    signupText: {
        fontSize: 14,
        color: '#666',
    },
    signupLink: {
        fontSize: 14,
        color: '#4c669f',
        fontWeight: 'bold',
    },
});

export default LoginScreen;