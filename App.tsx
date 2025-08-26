import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import YouTubeAuthScreen from './src/screens/YouTubeAuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ScheduleStreamScreen from './src/screens/ScheduleStreamScreen';

// Import types
import { RootStackParamList } from './src/types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Login"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#FF0000',
              },
              headerTintColor: '#FFFFFF',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ title: 'MultiBroadcaster Login' }}
            />
            <Stack.Screen 
              name="YouTubeAuth" 
              component={YouTubeAuthScreen}
              options={{ title: 'YouTube Authentication' }}
            />
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen}
              options={{ title: 'Broadcasting Dashboard' }}
            />
            <Stack.Screen 
              name="ScheduleStream" 
              component={ScheduleStreamScreen}
              options={{ title: 'Schedule Live Stream' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}