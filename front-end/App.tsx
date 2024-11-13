// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import ProfileScreen from './screens/ProfileScreen';
import ChartScreen from './screens/GraphScreen';
import BluetoothScreen from './screens/BluetoothScreen';
import CGMScreen from './screens/CGM';
import UpdatedGraphScreen from './screens/UpdatedGraphScreen';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<RootStackParamList>();
const APP_NAME = "Glucowizard";

const CustomHeader: React.FC<{ title: string; navigation: any }> = ({ title, navigation }) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity onPress={() => navigation.openDrawer()}>
      <Icon name="menu" size={28} color="#000" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
);

const StackWithCustomHeader = (screenName: keyof RootStackParamList, Component: React.ComponentType<any>) => (
  <Stack.Navigator>
    <Stack.Screen
      name={screenName}
      component={Component}
      options={({ navigation }) => ({
        header: () => <CustomHeader title={APP_NAME} navigation={navigation} />,
      })}
    />
  </Stack.Navigator>
);


const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Profile">
        <Drawer.Screen name="Profile" component={() => StackWithCustomHeader("Profile", ProfileScreen)} />
        <Drawer.Screen name="Graph" component={() => StackWithCustomHeader("Graph", ChartScreen)} />
        <Drawer.Screen name="Bluetooth" component={() => StackWithCustomHeader("Bluetooth", BluetoothScreen)} />
        <Drawer.Screen name="CGM" component={() => StackWithCustomHeader("CGM", CGMScreen)} />
        <Drawer.Screen name="UpdatedGraph" component={() => StackWithCustomHeader("UpdatedGraph", UpdatedGraphScreen)} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
});


export default App;
