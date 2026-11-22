import { useCallback, useState } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
    useWindowDimensions,
    Pressable,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';

import { getProductById, deleteProduct } from '../services/productService';
import { colors } from '../theme/colors';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailsScreen({ route, navigation }) {
    const { productId } = route.params;
    const { width } = useWindowDimensions();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageIndex, setImageIndex] = useState(0);
    const { user } = useAuth();
    const [deleting, setDeleting] = useState(false);

    useFocusEffect(
        useCallback(() => {
            let active = true;

            async function loadProduct() {
                try {
                    setLoading(true);
                    setError(null);

                    const data = await getProductById(productId);

                    if (active) {
                        setProduct(data);
                        setImageIndex(0);
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

            loadProduct();

            return () => {
                active = false;
            };
        }, [productId])
    );


    const handleDeleteProduct = () => {
        if (!product || !user || deleting) return;

        Alert.alert(
            'Delete listing',
            'Are you sure you want to delete this product? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: confirmDeleteProduct,
                },
            ]
        );
    };

    const confirmDeleteProduct = async () => {
        if (!product || !user || deleting) return;

        try {
            setDeleting(true);

            await deleteProduct(product.id, user.id);

            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setDeleting(false);
        }
    };


    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    if (error || !product) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>
                    {error || 'Product not found.'}
                </Text>
            </View>
        );
    }

    const isOwner = user?.id === product.user_id;

    return (
        <Screen style={styles.container}>
            <ScrollView>
                <View>
                    {product.images.length > 0 ? (
                        <>
                            <FlatList
                                data={product.images}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(_, index) => String(index)}
                                onMomentumScrollEnd={(event) => {
                                    const index = Math.round(
                                        event.nativeEvent.contentOffset.x / width
                                    );
                                    setImageIndex(index);
                                }}
                                renderItem={({ item }) => (
                                    <Image
                                        source={{ uri: item }}
                                        style={{
                                            width,
                                            height: width,
                                        }}
                                        resizeMode="cover"
                                    />
                                )}
                            />

                            <View style={styles.imageCounter}>
                                <Text style={styles.counterText}>
                                    {imageIndex + 1} / {product.images.length}
                                </Text>
                            </View>
                        </>
                    ) : (
                        <View
                            style={[
                                styles.placeholder,
                                { width, height: width },
                            ]}
                        >
                            <Ionicons
                                name="image-outline"
                                size={60}
                                color={colors.secondary}
                            />
                        </View>
                    )}
                </View>


                <View style={styles.details}>
                    <Text style={styles.title}>
                        {product.title}
                    </Text>

                    <Text style={styles.price}>
                        €{Number(product.price).toFixed(2)}
                    </Text>

                    <View style={styles.divider} />

                    <View style={styles.categoryRow}>
                        <Text style={styles.categoryLabel}>Category</Text>
                        <Text style={styles.categoryValue}>
                            {product.category}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>
                        Description
                    </Text>

                    <Text style={styles.description}>
                        {product.description || 'No description provided.'}
                    </Text>


                    {isOwner && (
                        <View style={styles.ownerActions}>
                            <Pressable
                                style={styles.editButton}
                                onPress={() =>
                                    navigation.navigate('ProductEdit', {
                                        productId: product.id,
                                    })
                                }
                            >
                                <Ionicons
                                    name="create-outline"
                                    size={20}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.editButtonText}>Edit listing</Text>
                            </Pressable>

                            <Pressable
                                style={styles.deleteButton}
                                onPress={handleDeleteProduct}
                                disabled={deleting}
                            >
                                <Ionicons
                                    name="trash-outline"
                                    size={20}
                                    color="#B42318"
                                />
                                <Text style={styles.deleteButtonText}>{deleting ? 'Deleting...' : 'Delete'}</Text>
                            </Pressable>
                        </View>
                    )}

                </View>
            </ScrollView>
        </Screen>
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
        backgroundColor: colors.background,
    },
    placeholder: {
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageCounter: {
        position: 'absolute',
        bottom: 14,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    counterText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    details: {
        padding: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: '750',
        color: colors.text,
        marginBottom: 12,
    },
    price: {
        fontSize: 25,
        fontWeight: '700',
        color: colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 24,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 10,
    },
    description: {
        fontSize: 15,
        lineHeight: 23,
        color: colors.secondary,
    },
    error: {
        color: '#B42318',
        textAlign: 'center',
        padding: 20,
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    categoryValue: {
        fontSize: 14,
        color: colors.secondary,
    },
    ownerActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 28,
    },
    editButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: colors.accent,
    },
    editButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 18,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5C7C7',
    },
    deleteButtonText: {
        color: '#B42318',
        fontWeight: '600',
        fontSize: 14,
    },
});