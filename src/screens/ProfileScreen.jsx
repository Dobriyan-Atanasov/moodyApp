import { View, Text, Pressable, Alert } from 'react-native';
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
            <View style={{ flex: 1, padding: 24 }}>
                <Text>Loading profile...</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <View style={{ flex: 1, padding: 24, gap: 16 }}>
                <Text>You are not logged in.</Text>

                <Pressable onPress={() => navigation.navigate('Login')}>
                    <Text style={{ color: '#92600C' }}>Login</Text>
                </Pressable>

                <Pressable onPress={() => navigation.navigate('Register')}>
                    <Text style={{ color: '#92600C' }}>Register</Text>
                </Pressable>
            </View>
        );
    }

    const firstName = user.user_metadata?.first_name;
    const lastName = user.user_metadata?.last_name;
    const nickname = user.user_metadata?.nickname;

    return (
        <View style={{ flex: 1, padding: 24, gap: 16 }}>

            <Text style={{ fontSize: 26, fontWeight: '700' }}>
                My Profile
            </Text>

            <Text>Name: {firstName} {lastName}</Text>
            <Text>Nickname: @{nickname}</Text>
            <Text>Email: {user.email}</Text>

            <Pressable
                onPress={handleLogout}
                style={{
                    backgroundColor: '#92600C',
                    padding: 16,
                    borderRadius: 10,
                    alignItems: 'center',
                }}
            >
                <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
                    Logout
                </Text>
            </Pressable>
        </View>
    );
}