import { useCallback, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Pressable,
    StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import { getMyProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import { colors } from '../theme/colors';
import { Spinner } from '@/components/ui/spinner';

export default function MyListingsScreen({ navigation }) {
    const { user } = useAuth();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        if (!user || refreshing) return;

        setRefreshing(true);

        try {
            const data = await getMyProducts(user.id);
            setProducts(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            let active = true;

            async function loadMyProducts() {
                if (!user) {
                    setProducts([]);
                    setError(null);
                    setLoading(false);
                    return;
                }

                try {
                    setLoading(true);
                    setError(null);

                    const data = await getMyProducts(user.id);

                    if (active) {
                        setProducts(data);
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

            loadMyProducts();

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

    const openCreateProduct = () => {
        navigation.getParent()?.navigate('ProductCreate');
    };

    if (!user) {
        return (
            <View style={styles.center}>
                <Text style={styles.title}>My Listings</Text>

                <Text style={styles.message}>
                    Log in to view and manage your listings.
                </Text>

                <Pressable
                    style={styles.button}
                    onPress={() =>
                        navigation.getParent()?.navigate('Login')
                    }
                >
                    <Text style={styles.buttonText}>Log in</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={products}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                keyExtractor={(item) => String(item.id)}
                numColumns={2}
                columnWrapperStyle={styles.productRow}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.title}>My Listings</Text>

                        <Text style={styles.subtitle}>
                            Products you've published
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
                    />
                )}
                ListEmptyComponent={
                    !loading && !error ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.empty}>
                                You haven't published any products yet.
                            </Text>

                            <Pressable
                                style={styles.button}
                                onPress={openCreateProduct}
                            >
                                <Text style={styles.buttonText}>
                                    Create listing
                                </Text>
                            </Pressable>
                        </View>
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
    button: {
        backgroundColor: colors.accent,
        paddingHorizontal: 28,
        paddingVertical: 13,
        borderRadius: 24,
        alignItems: 'center',
    },
    buttonText: {
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
    emptyContainer: {
        alignItems: 'center',
        marginTop: 30,
        gap: 16,
    },
    empty: {
        color: colors.secondary,
        textAlign: 'center',
    },
});