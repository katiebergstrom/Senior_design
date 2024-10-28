// screens/ProfileScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

type Props = {
  navigation: ProfileScreenNavigationProp;
};

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Information</Text>
      <Text>Name: John Doe</Text>
      <Text>Email: john.doe@example.com</Text>
      <Button
        title="Connect to bluetooth"
        onPress={() => navigation.navigate('Bluetooth')}
      />
      <Button
        title="View Chart"
        onPress={() => navigation.navigate('Graph', { heartRateHistory: [] })} // Replace [] with actual data if available
      />
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
});

export default ProfileScreen;
