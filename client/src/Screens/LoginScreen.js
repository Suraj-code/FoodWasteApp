import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Card, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

function LoginScreen(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigation = useNavigation();

    const handleLogin = async () => {
        
        try {
            const response = await axios.post('http://10.0.2.2:5000/login', {
                email,
                password
            });

            if (response.status === 200) {
                await AsyncStorage.setItem('token', response.data.access_token);
                Alert.alert('Login successful!')
                navigation.navigate('Main');
            }
        } catch (error) {
            if (error.response) {
                Alert.alert(error.response.data.message);
            }else {
                Alert.alert('An error occured')
            }
        }

    }

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Title title="Login" titleStyle={styles.title}></Card.Title>
                <Card.Content>
                    <TextInput
                        placeholder='Email'
                        value={email}
                        onChangeText={setEmail} 
                        style={styles.txtInput}
                    />
                    <TextInput 
                        secureTextEntry={true}
                        placeholder='Password'
                        value={password}
                        onChangeText={setPassword}
                        style={styles.txtInput}
                    />
                    <TouchableOpacity style={styles.btnStyle} onPress={handleLogin}>
                        <Text style={styles.btnText}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                        <Text style={styles.btnSignup}>Don't have an account? Click here to Sign up</Text>
                    </TouchableOpacity>
                </Card.Content>
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
    },

    card: {
        width: 350,
        padding: 10,
        margin: 5,
        elevation: 5,
        backgroundColor: 'gray',
        borderWidth: 2
    },

    title: {
        textAlign: 'center',
        color: 'Black',
        fontSize: 25
    },

    txtInput: {
        borderColor: 'black',
        borderWidth: 1,
        margin: 5
    },

    btnStyle: {
        backgroundColor: '#2196F3',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        margin: 3
    },

    btnText: {
        fontSize: 15,
        color: 'black',
        textAlign: 'center'
    },

    btnSignup: {
        fontSize: 12,
        textAlign: 'center',
        color: 'white'
    }
})

export default LoginScreen;