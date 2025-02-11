import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './app/screens/Login';
import List from './app/screens/List';
import Details from './app/screens/Details';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH } from './FirebaseConfig';
console.log(Login);

const Stack= createNativeStackNavigator();

const InsideStack = createNativeStackNavigator();
function InsideLayout()
{
  return(
    <InsideStack.Navigator>
      <InsideStack.Screen name="My todos" component={List}/>
      <InsideStack.Screen name="details" component={Details}/>
    </InsideStack.Navigator>
  )

}
export default function App() {
  const [user,setUser]= useState<User | null >(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      console.log('user', user);
      setUser(user); // Update the state with the current user
    });

  }, []);



  return (
   <NavigationContainer>
    <Stack.Navigator 
      initialRouteName='Login'>
        {user ? 
          <Stack.Screen 
          name='Inside' 
          component ={InsideLayout}
          options={{headerShown: false}}/>
        :
          <Stack.Screen 
            name='Login' 
            component ={Login}
            options={{headerShown: false}}/>
        }
    </Stack.Navigator>
   </NavigationContainer>
  );
};

