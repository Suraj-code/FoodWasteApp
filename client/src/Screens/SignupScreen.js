import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Card, Text } from 'react-native-paper';
// import { reporter } from '../../metro.config';
import { useNavigation } from '@react-navigation/native';

function SignupScreen(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [firstNameError, setFirstNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const validateName = (name) => {
        return name.length >= 2;
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

    const handleFirstNameChange = (text) => {
        setFirstName(text);
        if (text && !validateName(text)) {
            setFirstNameError('First name must be at least 2 characters');
        } else {
            setFirstNameError('');
        }
    };

    const handleLastNameChange = (text) => {
        setLastName(text);
        if (text && !validateName(text)) {
            setLastNameError('Last name must be at least 2 characters');
        } else {
            setLastNameError('');
        }
    };

    const handleSignup = async () => {
        // Reset errors
        setEmailError('');
        setPasswordError('');
        setFirstNameError('');
        setLastNameError('');

        // Validate inputs
        if (!email) {
            setEmailError('Email is required');
            return;
        }
        if (!password) {
            setPasswordError('Password is required');
            return;
        }
        if (!firstName) {
            setFirstNameError('First name is required');
            return;
        }
        if (!lastName) {
            setLastNameError('Last name is required');
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
        if (!validateName(firstName)) {
            setFirstNameError('First name must be at least 2 characters');
            return;
        }
        if (!validateName(lastName)) {
            setLastNameError('Last name must be at least 2 characters');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('http://10.0.2.2:5000/signup', {
                email,
                password,
                first_name: firstName,
                last_name: lastName
            });

            if (response.status === 200 || response.status === 201) {
                Alert.alert('Success', 'Account created successfully!');
                navigation.navigate('Login');
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 409) {
                    Alert.alert('Error', 'Email already exists');
                } else {
                    Alert.alert('Error', error.response.data.message || 'Something went wrong');
                }
            } else if (error.request) {
                Alert.alert('Error', 'No response from server. Please check your connection.');
            } else {
                Alert.alert('Error', error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <Text style={styles.appTitle}>Food Waste App</Text>
                <Text style={styles.tagline}>Join us in reducing food waste</Text>
            </View>

            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Fill in your details to get started</Text>

                    <View style={[styles.inputContainer, firstNameError ? styles.inputError : null]}>
                        <TextInput
                            placeholder='First Name'
                            value={firstName}
                            onChangeText={handleFirstNameChange}
                            style={styles.txtInput}
                            placeholderTextColor="#999"
                            autoCapitalize="words"
                        />
                    </View>
                    {firstNameError ? <Text style={styles.errorText}>{firstNameError}</Text> : null}

                    <View style={[styles.inputContainer, lastNameError ? styles.inputError : null]}>
                        <TextInput
                            placeholder='Last Name'
                            value={lastName}
                            onChangeText={handleLastNameChange}
                            style={styles.txtInput}
                            placeholderTextColor="#999"
                            autoCapitalize="words"
                        />
                    </View>
                    {lastNameError ? <Text style={styles.errorText}>{lastNameError}</Text> : null}

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
                        onPress={handleSignup}
                        disabled={isLoading}
                    >
                        <Text style={styles.btnText}>
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.loginContainer}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <Text style={styles.loginLink}>Log in</Text>
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
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 25,
    },
    loginText: {
        fontSize: 14,
        color: '#666',
    },
    loginLink: {
        fontSize: 14,
        color: '#4c669f',
        fontWeight: 'bold',
    },
});

export default SignupScreen;