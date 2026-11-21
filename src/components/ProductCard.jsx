import {
    View,
    Text,
    Image,
    Pressable,
    StyleSheet,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import { colors } from '../theme/colors';

export default function ProductCard({ product, onPress, isFavorite = false, onToggleFavorite }) {
    return (
        <Pressable style={styles.card} onPress={onPress}>
            <View>
                {product.images?.length > 0 ? (
                    <Image
                        source={{ uri: product.images[0] }}
                        style={styles.productImage}
                    />
                ) : (
                    <View style={[styles.productImage, styles.placeholder]}>
                        <Ionicons
                            name="image-outline"
                            size={30}
                            color={colors.secondary}
                        />
                    </View>
                )}

                <Pressable
                    style={styles.favoriteButton}
                    onPress={(event) => {
                        event.stopPropagation();
                        onToggleFavorite?.();
                    }}
                >
                    <Ionicons
                        name={isFavorite ? 'heart' : 'heart-outline'}
                        size={23}
                        color={isFavorite ? '#E5484D' : '#171717'}
                    />
                </Pressable>
            </View>

            <View style={styles.cardDetails}>
                <Text style={styles.productTitle} numberOfLines={2}>
                    {product.title}
                </Text>

                <Text style={styles.productCategory}>
                    {product.category}
                </Text>

                <Text style={styles.productPrice}>
                    €{Number(product.price).toFixed(2)}
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '48%',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: colors.surface,
    },
    productImage: {
        width: '100%',
        aspectRatio: 1,
        resizeMode: 'cover',
    },
    placeholder: {
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardDetails: {
        padding: 11,
        gap: 5,
    },
    productTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    productCategory: {
        fontSize: 12,
        color: colors.secondary,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
});