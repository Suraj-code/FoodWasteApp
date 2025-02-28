import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

function WelcomeScreen(props) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Welcome to my Food App!</Text>
            <View style={styles.buttonContainer}>
                <Button title="Login" onPress={() => console.log("Login Pressed")} />
            </View>
            <View style={styles.buttonContainer}>
                <Button title="Signup" onPress={() => console.log("Signup Pressed")} />
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
