import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

export default function Screen({ children, style, edges = ['bottom'] }) {
    return (
        <SafeAreaView
            style={[{ flex: 1, backgroundColor: colors.background }, style]}
            edges={edges}
        >
            {children}
        </SafeAreaView>
    );
}
