
import { View, Text, StyleSheet } from 'react-native';

export default function UserAvatar({ user, size = 40 }) {
    const firstName = user?.user_metadata?.first_name || '';
    const lastName = user?.user_metadata?.last_name || '';

    const initials = (
        firstName.charAt(0) + lastName.charAt(0)
    ).toUpperCase() || '?';

    return (
        <View
            style={[
                styles.avatar,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                },
            ]}
        >
            <Text style={{ fontSize: size * 0.35, fontWeight: '700' }}>
                {initials}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    avatar: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
});