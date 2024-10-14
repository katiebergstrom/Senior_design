// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import ProfileScreen from './screens/ProfileScreen';
import ChartScreen from './screens/GraphScreen';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Profile">
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Chart" component={ChartScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
