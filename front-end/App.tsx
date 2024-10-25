// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import ProfileScreen from './screens/ProfileScreen';
import ChartScreen from './screens/GraphScreen';
import BluetoothScreen from './screens/BluetoothScreen';
import CGMScreen from './screens/CGM';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Profile">
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Graph" component={ChartScreen} />
        <Stack.Screen name="Bluetooth" component={BluetoothScreen} />
        <Stack.Screen name="CGM" component={CGMScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
