import { useCallback, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { getProducts } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import ProductCard from '../components/ProductCard';
import { getFavorites, addFavorite, removeFavorite, } from '../services/favoriteService';

const CATEGORIES = ['All', 'Fashion', 'Technology', 'Sports'];

export default function HomeScreen({ navigation }) {
    const { user } = useAuth();

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('newest');
    const [sortOpen, setSortOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [updatingFavorite, setUpdatingFavorite] = useState(null);

    useFocusEffect(
        useCallback(() => {
            let active = true;

            async function loadProducts() {
                try {
                    setLoading(true);
                    setError(null);

                    const data = await getProducts();

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

            loadProducts();

            async function loadFavorites() {
                if (!user) {
                    setFavorites([]);
                    return;
                }

                try {
                    const data = await getFavorites(user.id);
                    if (active) setFavorites(data);
                } catch (err) {
                    console.error('Failed to load favorites:', err);
                }
            }

            loadFavorites();

            return () => {
                active = false;
            };
        }, [user?.id])
    );

    const visibleProducts = useMemo(() => {
        const query = search.trim().toLowerCase();

        const result = products.filter((product) => {
            const matchesCategory =
                category === 'All' || product.category === category;

            const matchesSearch =
                product.title.toLowerCase().includes(query);

            return matchesCategory && matchesSearch;
        });

        return result.sort((a, b) => {
            if (sort === 'priceAsc') {
                return Number(a.price) - Number(b.price);
            }

            if (sort === 'priceDesc') {
                return Number(b.price) - Number(a.price);
            }

            return new Date(b.created_at) - new Date(a.created_at);
        });
    }, [products, search, category, sort]);

    const openCreateProduct = () => {
        navigation.getParent()?.navigate(
            user ? 'ProductCreate' : 'Login'
        );
    };

    const openProductDetails = (productId) => {
        navigation.getParent()?.navigate('ProductDetails', {
            productId,
        });
    };

    const toggleFavorite = async (productId) => {
        if (!user) {
            navigation.getParent()?.navigate('Login');
            return;
        }

        if (updatingFavorite !== null) return;

        const isFavorite = favorites.includes(productId);
        setUpdatingFavorite(productId);

        try {
            if (isFavorite) {
                await removeFavorite(productId, user.id);
                setFavorites((current) =>
                    current.filter((id) => id !== productId)
                );
            } else {
                await addFavorite(productId, user.id);
                setFavorites((current) => [...current, productId]);
            }
        } catch (err) {
            console.error('Failed to update favorite:', err);
        } finally {
            setUpdatingFavorite(null);
        }
    };

    const renderProduct = ({ item }) => (
        <ProductCard
            product={item}
            onPress={() => openProductDetails(item.id)}
            isFavorite={favorites.includes(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
        />
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={visibleProducts}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderProduct}
                numColumns={2}
                columnWrapperStyle={styles.productRow}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                    <View>

                        <View style={styles.searchBox}>
                            <Ionicons
                                name="search-outline"
                                size={22}
                                color={colors.secondary}
                            />

                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search products"
                                placeholderTextColor={colors.secondary}
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>

                        <FlatList
                            horizontal
                            data={CATEGORIES}
                            keyExtractor={(item) => item}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categories}
                            renderItem={({ item }) => {
                                const selected = category === item;

                                return (
                                    <Pressable
                                        onPress={() => setCategory(item)}
                                        style={[
                                            styles.categoryButton,
                                            selected && styles.activeCategory,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryText,
                                                selected &&
                                                styles.activeCategoryText,
                                            ]}
                                        >
                                            {item}
                                        </Text>
                                    </Pressable>
                                );
                            }}
                        />

                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                Latest finds
                            </Text>

                            <Pressable
                                style={styles.sortButton}
                                onPress={() => setSortOpen(!sortOpen)}
                            >
                                <Text style={styles.sortText}>
                                    {sort === 'newest'
                                        ? 'Newest first'
                                        : sort === 'priceAsc'
                                            ? 'Lowest price'
                                            : 'Highest price'}
                                </Text>

                                <Ionicons
                                    name="chevron-down"
                                    size={17}
                                    color={colors.text}
                                />
                            </Pressable>
                        </View>

                        {sortOpen && (
                            <View style={styles.sortOptions}>
                                {[
                                    ['newest', 'Newest first'],
                                    ['priceAsc', 'Lowest price'],
                                    ['priceDesc', 'Highest price'],
                                ].map(([value, label]) => (
                                    <Pressable
                                        key={value}
                                        style={styles.sortOption}
                                        onPress={() => {
                                            setSort(value);
                                            setSortOpen(false);
                                        }}
                                    >
                                        <Text style={styles.sortText}>
                                            {label}
                                        </Text>

                                        {sort === value && (
                                            <Ionicons
                                                name="checkmark"
                                                size={18}
                                                color={colors.accent}
                                            />
                                        )}
                                    </Pressable>
                                ))}
                            </View>
                        )}

                        {loading && (
                            <ActivityIndicator
                                size="large"
                                color={colors.accent}
                                style={styles.loader}
                            />
                        )}

                        {error && (
                            <Text style={styles.error}>{error}</Text>
                        )}
                    </View>
                }
                ListEmptyComponent={
                    !loading && !error ? (
                        <Text style={styles.empty}>
                            No products found.
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
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 26,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    logo: {
        fontSize: 34,
        fontWeight: '800',
        letterSpacing: -1.8,
        color: colors.text,
    },
    logoDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.accent,
        marginLeft: 2,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 24,
        paddingHorizontal: 16,
        height: 52,
        marginBottom: 20,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: colors.text,
    },
    categories: {
        gap: 8,
        paddingBottom: 30,
    },
    categoryButton: {
        paddingHorizontal: 17,
        paddingVertical: 11,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    activeCategory: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    activeCategoryText: {
        color: '#FFFFFF',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 23,
        fontWeight: '750',
        color: colors.text,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    sortText: {
        fontSize: 13,
        color: colors.text,
    },
    sortOptions: {
        alignSelf: 'flex-end',
        width: 165,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        marginBottom: 16,
        backgroundColor: colors.surface,
        overflow: 'hidden',
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 13,
    },
    productRow: {
        gap: 12,
        marginBottom: 14,
    },
    loader: {
        marginVertical: 20,
    },
    error: {
        color: '#B42318',
        marginBottom: 16,
    },
    empty: {
        textAlign: 'center',
        color: colors.secondary,
        marginTop: 30,
    },
});