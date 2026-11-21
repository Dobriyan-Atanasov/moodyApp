import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    Alert,
    ScrollView,
    StyleSheet,
} from 'react-native';

import { registerUser } from '../services/authService';

export default function RegisterScreen({ navigation }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        const first = firstName.trim();
        const last = lastName.trim();
        const nick = nickname.trim().toLowerCase();
        const mail = email.trim().toLowerCase();

        if (!first || !last || !nick || !mail || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        if (!/^[a-z0-9_]{3,20}$/.test(nick)) {
            Alert.alert(
                'Invalid nickname',
                'Use 3–20 lowercase letters, numbers, or underscores.'
            );
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must contain at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const data = await registerUser(
                mail,
                password,
                first,
                last,
                nick
            );

            Alert.alert(
                'Registration successful',
                data.access_token
                    ? `Welcome, @${nick}!`
                    : 'Please check your email to confirm your account.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            Alert.alert('Registration failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
                Join MoodyApp and start selling.
            </Text>

            <Text style={styles.label}>First Name</Text>
            <TextInput
                style={styles.input}
                placeholder="First name"
                value={firstName}
                onChangeText={setFirstName}
                autoComplete="given-name"
            />

            <Text style={styles.label}>Last Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Last name"
                value={lastName}
                onChangeText={setLastName}
                autoComplete="family-name"
            />

            <Text style={styles.label}>Nickname</Text>
            <TextInput
                style={styles.input}
                placeholder="techmaster"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
                value={nickname}
                onChangeText={setNickname}
            />

            <Text style={styles.hint}>
                Your public name: @{nickname.trim().toLowerCase() || 'nickname'}
            </Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
                style={styles.input}
                placeholder="Email address"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                autoComplete="new-password"
                value={password}
                onChangeText={setPassword}
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
                style={styles.input}
                placeholder="Repeat password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            <Pressable
                style={[styles.button, loading && styles.disabled]}
                onPress={handleRegister}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Creating account...' : 'Register'}
                </Text>
            </Pressable>

            <Pressable onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>
                    Already have an account? Login
                </Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF8F5',
    },
    content: {
        padding: 24,
        paddingBottom: 40,
        gap: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#242424',
    },
    subtitle: {
        color: '#777B83',
        marginBottom: 16,
    },
    label: {
        color: '#242424',
        fontWeight: '600',
        marginTop: 6,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8E3DC',
        borderRadius: 10,
        padding: 14,
        color: '#242424',
    },
    hint: {
        color: '#92600C',
        fontSize: 12,
    },
    button: {
        backgroundColor: '#92600C',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 18,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    disabled: {
        opacity: 0.6,
    },
    link: {
        color: '#92600C',
        textAlign: 'center',
        marginTop: 16,
    },
});