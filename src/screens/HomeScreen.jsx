import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { getProducts } from '../services/productService';

export default function HomeScreen({ navigation }) {

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await getProducts();
                console.log('Supabase products:', data);
            } catch (error) {
                console.log('Supabase error:', error.message);
            }
        };

        loadProducts();
    }, []);

    return (
        <View style={{ flex: 1, padding: 20, gap: 20 }}>
            <Text>Welcome to MoodyApp Marketplace</Text>

            <Pressable
                onPress={() => navigation.navigate('ProductCreate')}
                style={{
                    backgroundColor: '#92600C',
                    padding: 15,
                    borderRadius: 10,
                    alignItems: 'center',
                }}
            >
                <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
                    Create Product
                </Text>
            </Pressable>

            <Pressable
                onPress={() => navigation.navigate('Register')}
                style={{
                    backgroundColor: '#242424',
                    padding: 15,
                    borderRadius: 10,
                    alignItems: 'center',
                }}
            >
                <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
                    Register
                </Text>
            </Pressable>


            <Pressable
                onPress={() => navigation.navigate('Login')}
                style={{
                    backgroundColor: '#92600C',
                    padding: 15,
                    borderRadius: 10,
                    alignItems: 'center',
                }}
            >
                <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
                    Login
                </Text>
            </Pressable>

        </View>
    );
}