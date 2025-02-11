import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { NavigationProp } from '@react-navigation/native';
import { FIREBASE_AUTH } from '../../FirebaseConfig';

interface RouterProps {
    navigation: NavigationProp<any, any>;
}

const List = ({ navigation }: RouterProps) => {
    const handleLogout = () => {
        FIREBASE_AUTH.signOut();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome! You are logged in.</Text>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('details')}>
                <Text style={styles.buttonText}>Open Details</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

export default List;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    button: {
        backgroundColor: '#6200ee',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginVertical: 10,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: '#fff',
        borderColor: '#6200ee',
        borderWidth: 1,
    },
    logoutButtonText: {
        color: '#6200ee',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
