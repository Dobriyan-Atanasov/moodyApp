
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';

import MainTabs from './navigation/MainTabs';
import ProductDetailsScreen from './screens/ProductDetailsScreen';

import ProductCreateScreen from './screens/ProductCreateScreen';

import RegisterScreen from './screens/RegisterScreen';

import LoginScreen from './screens/LoginScreen';

import '@/global.css';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GluestackUIProvider mode="light">
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />

          <Stack.Navigator>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="ProductDetails"
              component={ProductDetailsScreen}
              options={{ title: 'Product Details' }}
            />

            <Stack.Screen
              name="ProductCreate"
              component={ProductCreateScreen}
              options={{ title: 'Create Product' }}
            />

            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Register' }}
            />

            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'Login' }}
            />

          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
}