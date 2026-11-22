import { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    Alert,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

import { useAuth } from '../context/AuthContext';
import { getProductById, updateProduct } from '../services/productService';
import Screen from '../components/Screen';

const CATEGORIES = ['Fashion', 'Technology', 'Sports'];

export default function ProductEditScreen({ navigation, route }) {
    const { productId } = route.params;
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [categoryOpen, setCategoryOpen] = useState(false);

    useEffect(() => {
        let active = true;

        async function loadProduct() {
            try {
                const product = await getProductById(productId);

                if (!active) return;

                if (product.user_id !== user?.id) {
                    throw new Error('You cannot edit this product.');
                }

                setTitle(product.title);
                setDescription(product.description || '');
                setPrice(String(product.price));
                setCategory(product.category);
            } catch (error) {
                if (active) {
                    Alert.alert('Error', error.message);
                    navigation.goBack();
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
    }, [productId, user?.id, navigation]);

    const handleUpdateProduct = async () => {
        if (!title.trim() || !price.trim() || !category.trim()) {
            Alert.alert(
                'Missing information',
                'Complete the required fields.'
            );
            return;
        }

        const numericPrice = Number(price);

        if (!Number.isFinite(numericPrice) || numericPrice < 0) {
            Alert.alert(
                'Invalid price',
                'Enter a valid non-negative price.'
            );
            return;
        }

        if (!user) {
            Alert.alert('Login required', 'Please log in first.');
            return;
        }

        if (saving) return;

        try {
            setSaving(true);

            await updateProduct(
                productId,
                title.trim(),
                description.trim(),
                numericPrice,
                category.trim(),
                user.id
            );

            Alert.alert(
                'Success',
                'Product updated successfully.'
            );

            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Screen>
                <View style={styles.center}>
                    <ActivityIndicator
                        size="large"
                        color="#92600C"
                    />
                </View>
            </Screen>
        );
    }

    return (
        <Screen>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.heading}>Edit Product</Text>

                <Text style={styles.label}>Product title *</Text>

                <TextInput
                    style={styles.input}
                    placeholder="e.g. Samsung Galaxy S25"
                    value={title}
                    onChangeText={setTitle}
                />

                <Text style={styles.label}>Description</Text>

                <TextInput
                    style={[styles.input, styles.description]}
                    placeholder="Describe the condition and features"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    textAlignVertical="top"
                />

                <Text style={styles.label}>Price *</Text>

                <TextInput
                    style={styles.input}
                    placeholder="e.g. 750"
                    keyboardType="decimal-pad"
                    value={price}
                    onChangeText={setPrice}
                />

                <Text style={styles.label}>Category *</Text>

                <Pressable
                    style={styles.categorySelector}
                    onPress={() => setCategoryOpen(!categoryOpen)}
                >
                    <Text
                        style={{
                            color: category ? '#242424' : '#777B83',
                            fontSize: 16,
                        }}
                    >
                        {category || 'Select a category'}
                    </Text>

                    <Ionicons
                        name={categoryOpen ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#777B83"
                    />
                </Pressable>

                {categoryOpen && (
                    <View style={styles.categoryOptions}>
                        {CATEGORIES.map((item) => (
                            <Pressable
                                key={item}
                                style={styles.categoryOption}
                                onPress={() => {
                                    setCategory(item);
                                    setCategoryOpen(false);
                                }}
                            >
                                <Text style={styles.categoryOptionText}>
                                    {item}
                                </Text>

                                {category === item && (
                                    <Ionicons
                                        name="checkmark"
                                        size={20}
                                        color="#92600C"
                                    />
                                )}
                            </Pressable>
                        ))}
                    </View>
                )}

                <Pressable
                    style={[
                        styles.submitButton,
                        saving && styles.disabledButton,
                    ]}
                    onPress={handleUpdateProduct}
                    disabled={saving}
                >
                    <Text style={styles.submitText}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Text>
                </Pressable>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF8F5',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAF8F5',
    },
    heading: {
        fontSize: 26,
        fontWeight: '700',
        color: '#242424',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#242424',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E8E3DC',
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        padding: 12,
        marginBottom: 18,
        fontSize: 16,
        color: '#242424',
    },
    description: {
        height: 100,
    },
    categorySelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 12,
        padding: 14,
        marginBottom: 18,
    },
    categoryOptions: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 12,
        marginTop: -10,
        marginBottom: 18,
        overflow: 'hidden',
    },
    categoryOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E5E5',
    },
    categoryOptionText: {
        fontSize: 16,
        color: '#242424',
    },
    submitButton: {
        backgroundColor: '#92600C',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 6,
    },
    disabledButton: {
        opacity: 0.6,
    },
    submitText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});