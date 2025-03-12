import React, { useState } from 'react';
import { View, TextInput, Button, Alert, AsyncStorage, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Card, Text } from 'react-native-paper';
// import { reporter } from '../../metro.config';
import { useNavigation } from '@react-navigation/native';

function SignupScreen(props) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [first_name, setFirstName] = useState('');
    const [last_name, setlastName] = useState('');
    const navigation = useNavigation();

    const handleSignup = async () => {

        console.log("Email:", email);
        console.log("First Name:", first_name);
        console.log("Last Name:", last_name);
        console.log("Password:", password);

        if (!email || !password || !first_name || !last_name) {
            
            Alert.alert("Error, please enter all required fields");
            return;
        }


        try {

            const response = await axios.post('http://10.0.2.2:5000/signup', {
                email,
                password,
                first_name,
                last_name
            });

            if (response.status == 200 || 201) {
                Alert.alert("Signup successfull!")
            } else {
                Alert.alert("Signup failed")
            }
            
        } catch (error) {
            console.log("Signup Error:", error);

            if (error.response) {
                    console.log("Response Data:", error.response.data);
                    console.log("Response Status:", error.response.status);
                    console.log("Response Headers:", error.response.headers);
                    Alert.alert('Error', error.response.data.message || 'Something went wrong');
                } else if (error.request) {
                    console.log("Request Data:", error.request);
                    Alert.alert('Error', 'No response from server. Check if Flask is running.');
                } else {
                    console.log("Error Message:", error.message);
                    Alert.alert('Error', error.message);
                }
        }
        
    };


    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Title title="Signup" titleStyle={styles.title}></Card.Title>
                <Card.Content>
                    <TextInput
                        placeholder='Email' 
                        value={email}
                        onChangeText={setEmail}
                        style={styles.txtInput}
                    />
                    <TextInput 
                        placeholder='First Name'
                        value={first_name}
                        onChangeText={setFirstName}
                        style={styles.txtInput}
                    />
                    <TextInput 
                        placeholder='Last Name'
                        value={last_name}
                        onChangeText={setlastName}
                        style={styles.txtInput}
                    />
                    <TextInput 
                        secureTextEntry={true}
                        placeholder='Password'
                        value={password}
                        onChangeText={setPassword}
                        style={styles.txtInput}
                    />
                    <TouchableOpacity style={styles.btnStyle} onPress={handleSignup}>
                        <Text style={styles.btnText}>Signup</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.btnSignup} >Have an account? Click here to Login</Text>
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
        margin: 5,
        borderRadius: 8
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


export default SignupScreen;