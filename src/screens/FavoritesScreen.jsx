import { useCallback, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import { getProducts } from '../services/productService';
import {
    getFavorites,
    removeFavorite,
} from '../services/favoriteService';
import ProductCard from '../components/ProductCard';
import { colors } from '../theme/colors';
import { Spinner } from '@/components/ui/spinner';

export default function FavoritesScreen({ navigation }) {
    const { user } = useAuth();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingFavorite, setUpdatingFavorite] = useState(null);

    useFocusEffect(
        useCallback(() => {
            let active = true;

            async function loadFavorites() {
                if (!user) {
                    setProducts([]);
                    setLoading(false);
                    return;
                }

                try {
                    setLoading(true);
                    setError(null);

                    const [allProducts, favoriteIds] = await Promise.all([
                        getProducts(),
                        getFavorites(user.id),
                    ]);

                    if (active) {
                        setProducts(
                            allProducts.filter((product) =>
                                favoriteIds.includes(product.id)
                            )
                        );
                    }
                } catch (err) {
                    if (active) {
                        setError(err.message);
                    }
                } finally {
                    if (active) {
                        setLoading(false);
                    }
                }
            }

            loadFavorites();

            return () => {
                active = false;
            };
        }, [user?.id])
    );

    const openProductDetails = (productId) => {
        navigation.getParent()?.navigate('ProductDetails', {
            productId,
        });
    };

    const removeFromFavorites = async (productId) => {
        if (updatingFavorite !== null) return;

        setUpdatingFavorite(productId);

        try {
            await removeFavorite(productId, user.id);

            setProducts((current) =>
                current.filter((product) => product.id !== productId)
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdatingFavorite(null);
        }
    };

    if (!user) {
        return (
            <View style={styles.center}>
                <Text style={styles.title}>Your favorites</Text>
                <Text style={styles.message}>
                    Log in to save and view your favorite products.
                </Text>

                <Pressable
                    style={styles.loginButton}
                    onPress={() =>
                        navigation.getParent()?.navigate('Login')
                    }
                >
                    <Text style={styles.loginText}>Log in</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={products}
                keyExtractor={(item) => String(item.id)}
                numColumns={2}
                columnWrapperStyle={styles.productRow}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.title}>Your favorites</Text>
                        <Text style={styles.subtitle}>
                            Products you've saved
                        </Text>

                        {loading && (
                            <View style={styles.loader}>
                                <Spinner size="large" color={colors.accent} />
                            </View>
                        )}

                        {error && (
                            <Text style={styles.error}>{error}</Text>
                        )}
                    </View>
                }
                renderItem={({ item }) => (
                    <ProductCard
                        product={item}
                        onPress={() => openProductDetails(item.id)}
                        isFavorite={true}
                        onToggleFavorite={() =>
                            removeFromFavorites(item.id)
                        }
                    />
                )}
                ListEmptyComponent={
                    !loading && !error ? (
                        <Text style={styles.empty}>
                            No favorite products yet.
                        </Text>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: colors.background,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 30,
        flexGrow: 1,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 25,
        fontWeight: '750',
        color: colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: colors.secondary,
        marginTop: 5,
    },
    message: {
        fontSize: 14,
        color: colors.secondary,
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: colors.accent,
        paddingHorizontal: 28,
        paddingVertical: 13,
        borderRadius: 24,
    },
    loginText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    productRow: {
        gap: 12,
        marginBottom: 14,
    },
    loader: {
        marginTop: 24,
    },
    error: {
        color: '#B42318',
        marginTop: 15,
    },
    empty: {
        textAlign: 'center',
        color: colors.secondary,
        marginTop: 30,
    },
});