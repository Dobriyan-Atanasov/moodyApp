import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
    const { user, loading, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            Alert.alert('Success', 'You have logged out.');
        } catch (error) {
            Alert.alert('Logout failed', error.message);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <Text>Loading profile...</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.center}>
                <Text style={styles.title}>My Profile</Text>

                <Text style={styles.subtitle}>
                    Log in or create an account to manage your profile.
                </Text>

                <Pressable
                    style={styles.loginButton}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.loginButtonText}>Log in</Text>
                </Pressable>

                <Pressable
                    style={styles.registerButton}
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text style={styles.registerButtonText}>Register</Text>
                </Pressable>
            </View>
        );
    }

    const firstName = user.user_metadata?.first_name;
    const lastName = user.user_metadata?.last_name;
    const nickname = user.user_metadata?.nickname;

    return (
        <View style={styles.profileContainer}>
            <Text style={styles.profileTitle}>My Profile</Text>

            <Text>Name: {firstName} {lastName}</Text>
            <Text>Nickname: @{nickname}</Text>
            <Text>Email: {user.email}</Text>

            <Pressable
                onPress={handleLogout}
                style={styles.logoutButton}
            >
                <Text style={styles.loginButtonText}>Logout</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 25,
        fontWeight: '750',
        color: '#171717',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#737373',
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: '#92600C',
        paddingHorizontal: 28,
        paddingVertical: 13,
        borderRadius: 24,
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    registerButton: {
        borderWidth: 1,
        borderColor: '#92600C',
        paddingHorizontal: 28,
        paddingVertical: 13,
        borderRadius: 24,
        alignItems: 'center',
        marginTop: 12,
    },
    registerButtonText: {
        color: '#92600C',
        fontWeight: '600',
    },
    profileContainer: {
        flex: 1,
        padding: 24,
        gap: 16,
        backgroundColor: '#FFFFFF',
    },
    profileTitle: {
        fontSize: 26,
        fontWeight: '700',
    },
    logoutButton: {
        backgroundColor: '#92600C',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
});