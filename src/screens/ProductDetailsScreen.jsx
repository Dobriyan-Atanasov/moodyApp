import { View, Text } from 'react-native';

export default function ProductDetailsScreen({ route }) {
    const { productId } = route.params;

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text>Product Details - ID: {productId}</Text>
        </View>
    );
}
