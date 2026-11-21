import { View, Text, Pressable, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import AnimatedButton from './AnimatedButton';

export default function AppHeader() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: insets.top,
                    height: 70 + insets.top,
                },
            ]}>
            <View style={styles.logoRow}>
                <Text style={styles.logo}>moody</Text>
                <View style={styles.dot} />
            </View>


            <View style={styles.actions}>
                <AnimatedButton
                    style={styles.addButton}
                    onPress={() =>
                        navigation.getParent()?.navigate(
                            user ? 'ProductCreate' : 'Login'
                        )
                    }
                >
                    <Ionicons name="add" size={25} color="#171717" />
                </AnimatedButton>

                <AnimatedButton
                    onPress={() =>
                        navigation.getParent()?.navigate('Profile')
                    }
                >
                    {user ? (
                        <UserAvatar user={user} size={42} />
                    ) : (
                        <View style={styles.addButton}>
                            <Ionicons
                                name="person-outline"
                                size={23}
                                color="#171717"
                            />
                        </View>
                    )}
                </AnimatedButton>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 70,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    logo: {
        fontSize: 34,
        fontWeight: '800',
        letterSpacing: -1.8,
        color: '#171717',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#92600C',
        marginLeft: 2,
        marginBottom: 3,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    addButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        justifyContent: 'center',
        alignItems: 'center',
    },
});