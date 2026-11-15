import { View, Text } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';

export default function HomeScreen({ navigation }) {
    return (
        <View style={{ flex: 1, padding: 20, gap: 20 }}>
            <Text>Welcome to MoodyApp Marketplace</Text>

            <Button
                onPress={() =>
                    navigation.navigate('ProductDetails', {
                        productId: 1,
                    })
                }
            >
                <ButtonText>View Product</ButtonText>
            </Button>
        </View>
    );
}