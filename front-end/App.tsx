import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

import ProfileScreen from './screens/ProfileScreen';
import CGMScreen from './screens/CGM';
import OldGraphsScreen from './screens/OldGraphsScreen';
import { RootStackParamList } from './types';

//This creates the 3 bar navigator in top lefthand corner
const Drawer = createDrawerNavigator<RootStackParamList>();
const APP_NAME = "Glucowizard";

//Create header that has biorasis logo
const CustomHeader: React.FC<{ title: string; navigation: any }> = ({ title, navigation }) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity onPress={() => navigation.openDrawer()}>
      <Icon name="menu" size={28} color="#000" />
    </TouchableOpacity>
    <Image source={require('./images/biorasis-logo.jpg')} style={styles.appLogo} />
  </View>
);

const App: React.FC = () => {
  return (
    // Include all necessary screens in navigation for 3 bar icon
    <NavigationContainer>
      {/* Start the app on the profile screen */}
      <Drawer.Navigator initialRouteName="Profile">
        <Drawer.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={({ navigation }) => ({
            header: () => <CustomHeader title={APP_NAME} navigation={navigation} />,
          })} 
        />
        <Drawer.Screen 
          name="CGM" 
          component={CGMScreen} 
          options={({ navigation }) => ({
            header: () => <CustomHeader title={APP_NAME} navigation={navigation} />,
          })} 
        />  
        <Drawer.Screen 
          name="OldGraphs" 
          component={OldGraphsScreen} 
          options={({ navigation }) => ({
            header: () => <CustomHeader title={APP_NAME} navigation={navigation} />,
          })} 
        />  
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
  menuButton: {
    padding: 10,
  },
  menuText: {
    fontSize: 28, 
    color: '#000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  appLogo: {
    width: 100,  
    height: 40, 
    resizeMode: 'contain',
    marginLeft: 16,
  }
});

export default App;
