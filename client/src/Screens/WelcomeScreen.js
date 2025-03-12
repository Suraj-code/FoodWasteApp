import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

function WelcomeScreen(props) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Welcome to my Food App!</Text>
            <View style={styles.buttonContainer}>
                <Button title="Login" onPress={() => props.navigation.navigate('Login')} />
            </View>
            <View style={styles.buttonContainer}>
                <Button title="Signup" onPress={() => props.navigation.navigate('Signup')} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20, // Adds spacing between text and buttons
    },
    buttonContainer: {
        width: "50%", 
        marginVertical: 10, // Adds spacing between buttons
    }
});

export default WelcomeScreen;
