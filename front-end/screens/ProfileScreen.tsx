import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

//Extremely basic profile screen that we need to eventually connect to login info

type Props = StackScreenProps<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Information</Text>
      <Text>Name: John Doe</Text>
      <Text>Email: john.doe@example.com</Text>
      <View style={styles.button}>
        <Button
          title="Connect to Bluetooth"
          onPress={() => navigation.navigate('CGM')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    paddingTop: 25
  }
});

export default ProfileScreen;
