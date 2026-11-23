import { StatusBar, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import MainTabs from './navigation/MainTabs';
import ProductDetailsScreen from './screens/ProductDetailsScreen';
import ProductCreateScreen from './screens/ProductCreateScreen';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProductEditScreen from './screens/ProductEditScreen';
import '@/global.css';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />

      <Stack.Navigator
        screenOptions={{
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text
                style={{
                  fontSize: 34,
                  fontWeight: '800',
                  letterSpacing: -1.8,
                  color: '#171717',
                }}
              >
                moody
              </Text>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#92600C',
                  marginLeft: 2,
                  marginBottom: 3,
                }}
              />
            </View>
          ),
          headerTitleAlign: 'left',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#171717',
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ProductDetails"
          component={ProductDetailsScreen}
        />

        {user && (
          <Stack.Group navigationKey="authenticated">
            <Stack.Screen
              name="ProductCreate"
              component={ProductCreateScreen}
            />
            <Stack.Screen
              name="ProductEdit"
              component={ProductEditScreen}
            />
          </Stack.Group>
        )}

        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GluestackUIProvider mode="light">
      <SafeAreaProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
}