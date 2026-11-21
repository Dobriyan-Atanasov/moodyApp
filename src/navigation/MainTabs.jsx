import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';

import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import MyListingsScreen from '../screens/MyListingsScreen';
import AppHeader from '../components/AppHeader';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: true,
                header: () => <AppHeader />,

                tabBarActiveTintColor: '#92600C',
                tabBarInactiveTintColor: '#737373',

                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopColor: '#E5E5E5',
                    borderTopWidth: 1,
                    elevation: 0,
                },

                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },

                tabBarIcon: ({ focused, color, size }) => {
                    const icons = {
                        Home: focused ? 'home' : 'home-outline',
                        Favorites: focused ? 'heart' : 'heart-outline',
                        MyListings: focused ? 'albums' : 'albums-outline',
                    };

                    return (
                        <Ionicons
                            name={icons[route.name]}
                            size={size}
                            color={color}
                        />
                    );
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Favorites" component={FavoritesScreen} />
            <Tab.Screen
                name="MyListings"
                component={MyListingsScreen}
                options={{ title: 'My Listings' }}
            />
        </Tab.Navigator>
    );
}