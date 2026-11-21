
import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    Alert,
    StyleSheet,
} from 'react-native';

import { loginUser } from '../services/authService';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            Alert.alert('Error', 'Please enter your email and password.');
            return;
        }

        setLoading(true);

        try {
            const data = await loginUser(email.trim(), password);

            console.log('Login successful:', data.user?.email);

            Alert.alert('Success', 'You are logged in!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Login failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Pressable
                style={[styles.button, loading && { opacity: 0.6 }]}
                onPress={handleLogin}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Logging in...' : 'Login'}
                </Text>
            </Pressable>

            <Pressable onPress={() => navigation.navigate('Register')}>
                <Text style={styles.link}>
                    Don't have an account? Register
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF8F5',
        padding: 24,
        justifyContent: 'center',
        gap: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#242424',
        marginBottom: 12,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8E3DC',
        borderRadius: 10,
        padding: 14,
        color: '#242424',
    },
    button: {
        backgroundColor: '#92600C',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    link: {
        color: '#92600C',
        textAlign: 'center',
        marginTop: 10,
    },
});