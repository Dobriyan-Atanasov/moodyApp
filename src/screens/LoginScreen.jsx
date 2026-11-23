import { useState } from 'react';
import {
    Text,
    TextInput,
    Pressable,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import Screen from '../components/Screen';

export default function LoginScreen({ navigation }) {
    const { login } = useAuth();

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
            await login(email.trim(), password);

            Alert.alert('Success', 'You are logged in!');
            navigation.popTo('MainTabs', { screen: 'Home' });
        } catch (error) {
            Alert.alert('Login failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Screen>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
                >
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
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
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