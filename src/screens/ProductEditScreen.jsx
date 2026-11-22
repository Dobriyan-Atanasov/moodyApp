import { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Image,
    Pressable,
    ScrollView,
    Alert,
    StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@react-native-vector-icons/ionicons';

import { useAuth } from '../context/AuthContext';
import { getProductById, updateProduct } from '../services/productService';
import {
    uploadProductPhoto,
    saveProductPhoto,
    deleteProductPhoto,
    deletePhotoFromStorage,
    updateProductPhotoOrder,
} from '../services/photoService';
import { colors } from '../theme/colors';
import Screen from '../components/Screen';
import { Spinner } from '@/components/ui/spinner';
import DraggableGrid from 'react-native-draggable-grid';

const MAX_PHOTOS = 5;
const CATEGORIES = ['Fashion', 'Technology', 'Sports'];

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

export default function ProductEditScreen({ navigation, route }) {
    const { productId } = route.params;
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [categoryOpen, setCategoryOpen] = useState(false);

    const [photos, setPhotos] = useState([]);
    const [removedPhotos, setRemovedPhotos] = useState([]);
    const [isDragging, setIsDragging] = useState(false);


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

                const existingPhotos = product.product_images.map(image => ({
                    key: `existing-${image.id}`,
                    id: image.id,
                    storagePath: image.storage_path,
                    displayOrder: image.display_order,
                    uri: `${SUPABASE_URL}/storage/v1/object/public/product-images/${image.storage_path}`,
                    existing: true,
                }));

                setPhotos(existingPhotos);
                setRemovedPhotos([]);
            } catch (error) {
                if (active) {
                    Alert.alert('Error', error.message, [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack(),
                        },
                    ]);
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

    const chooseFromGallery = async () => {
        if (saving) return;

        const remaining = MAX_PHOTOS - photos.length;

        if (remaining <= 0) {
            Alert.alert('Photo limit', 'You can add up to 5 photos.');
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: true,
                selectionLimit: remaining,
                quality: 0.8,
            });

            if (!result.canceled) {
                setPhotos(current => [
                    ...current,
                    ...result.assets
                        .slice(0, MAX_PHOTOS - current.length)
                        .map(asset => ({
                            ...asset,
                            key: `new-${asset.assetId || asset.uri}`,
                            existing: false,
                        })),
                ]);
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const takePhoto = async () => {
        if (saving) return;

        if (photos.length >= MAX_PHOTOS) {
            Alert.alert('Photo limit', 'You can add up to 5 photos.');
            return;
        }

        try {
            const permission =
                await ImagePicker.requestCameraPermissionsAsync();

            if (!permission.granted) {
                Alert.alert(
                    'Camera permission',
                    'Camera access is required to take photos.'
                );
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.8,
            });

            if (!result.canceled) {
                setPhotos(current => [
                    ...current,
                    ...result.assets
                        .slice(0, MAX_PHOTOS - current.length)
                        .map(asset => ({
                            ...asset,
                            key: `new-${asset.assetId || asset.uri}`,
                            existing: false,
                        })),
                ]);
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const removePhoto = index => {
        if (saving) return;

        const photo = photos[index];

        if (photo.existing) {
            setRemovedPhotos(current => [...current, photo]);
        }

        setPhotos(current =>
            current.filter((_, photoIndex) => photoIndex !== index)
        );
    };

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
            setSaveMessage('Updating product...');

            await updateProduct(
                productId,
                title.trim(),
                description.trim(),
                numericPrice,
                category.trim(),
                user.id
            );

            const newPhotos = photos.filter(photo => !photo.existing);
            const existingPhotos = photos.filter(photo => photo.existing);
            const photosToSave = photos.map(photo => ({ ...photo }));

            // Continue numbering after the retained photos.
            // Existing photo order is preserved.
            const nextDisplayOrder = existingPhotos.length
                ? Math.max(...existingPhotos.map(photo => photo.displayOrder)) + 1
                : 0;

            for (let index = 0; index < newPhotos.length; index++) {
                setSaveMessage(
                    `Uploading photo ${index + 1} of ${newPhotos.length}...`
                );

                const storagePath = await uploadProductPhoto(
                    newPhotos[index],
                    productId,
                    user.id,
                    index
                );

                await saveProductPhoto(
                    productId,
                    storagePath,
                    nextDisplayOrder + index,
                );

                const photoIndex = photosToSave.findIndex(
                    photo => photo.key === newPhotos[index].key
                );

                photosToSave[photoIndex] = {
                    ...photosToSave[photoIndex],
                    storagePath,
                };
            }

            const failedDeletions = [];

            for (let index = 0; index < removedPhotos.length; index++) {
                const photo = removedPhotos[index];

                setSaveMessage(
                    `Removing photo ${index + 1} of ${removedPhotos.length}...`
                );

                try {
                    await deleteProductPhoto(photo.id);
                } catch (error) {
                    failedDeletions.push(error.message);
                    continue;
                }

                try {
                    await deletePhotoFromStorage(photo.storagePath);
                } catch (error) {
                    failedDeletions.push(error.message);
                }
            }


            setSaveMessage('Saving photo order...');

            const refreshedProduct = await getProductById(productId);

            const photoIdsByPath = new Map(
                refreshedProduct.product_images.map(image => [
                    image.storage_path,
                    image.id,
                ])
            );

            // Temporary positions prevent collisions while reordering.
            for (let index = 0; index < photosToSave.length; index++) {
                const photoId = photoIdsByPath.get(photosToSave[index].storagePath);

                if (!photoId) {
                    throw new Error('Could not identify a photo for reordering.');
                }

                await updateProductPhotoOrder(photoId, 10000 + index);
            }

            // Final positions: 0 is the cover photo.
            for (let index = 0; index < photosToSave.length; index++) {
                const photoId = photoIdsByPath.get(photosToSave[index].storagePath);

                await updateProductPhotoOrder(photoId, index);
            }


            if (failedDeletions.length > 0) {
                Alert.alert(
                    'Partially completed',
                    'Product information was saved, but some photos could not be fully removed. Please check Supabase Storage.'
                );
            } else {
                Alert.alert(
                    'Success',
                    'Product updated successfully.'
                );
            }

            navigation.goBack();
        } catch (error) {
            Alert.alert(
                'Save incomplete',
                `${error.message}\n\nSome changes may already have been saved. Reopen the listing to check before trying again.`
            );
        } finally {
            setSaving(false);
            setSaveMessage('');
        }
    };

    if (loading) {
        return (
            <Screen>
                <View style={styles.center}>
                    <Spinner size="large" color={colors.accent} />
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
                scrollEnabled={!isDragging}
            >
                <Text style={styles.heading}>Edit Product</Text>

                <Text style={styles.label}>Product title *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Samsung Galaxy S25"
                    value={title}
                    onChangeText={setTitle}
                    editable={!saving}
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.description]}
                    placeholder="Describe the condition and features"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    textAlignVertical="top"
                    editable={!saving}
                />

                <Text style={styles.label}>Price *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. 750"
                    keyboardType="decimal-pad"
                    value={price}
                    onChangeText={setPrice}
                    editable={!saving}
                />

                <Text style={styles.label}>Category *</Text>

                <Pressable
                    style={styles.categorySelector}
                    onPress={() => setCategoryOpen(!categoryOpen)}
                    disabled={saving}
                >
                    <Text style={{
                        color: category ? '#242424' : '#777B83',
                        fontSize: 16,
                    }}>
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
                        {CATEGORIES.map(item => (
                            <Pressable
                                key={item}
                                style={styles.categoryOption}
                                onPress={() => {
                                    setCategory(item);
                                    setCategoryOpen(false);
                                }}
                                disabled={saving}
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

                <Text style={styles.label}>
                    Product photos ({photos.length}/{MAX_PHOTOS})
                </Text>

                <View style={styles.buttonRow}>
                    <Pressable
                        style={styles.photoButton}
                        onPress={chooseFromGallery}
                        disabled={saving}
                    >
                        <Ionicons
                            name="images-outline"
                            size={24}
                            color="#92600C"
                        />
                        <Text style={styles.photoButtonText}>
                            Gallery
                        </Text>
                    </Pressable>

                    <Pressable
                        style={styles.photoButton}
                        onPress={takePhoto}
                        disabled={saving}
                    >
                        <Ionicons
                            name="camera-outline"
                            size={24}
                            color="#92600C"
                        />
                        <Text style={styles.photoButtonText}>
                            Camera
                        </Text>
                    </Pressable>
                </View>


                <Text style={styles.photoHint}>
                    Hold and drag to reorder photos.
                    The first photo is your cover.
                </Text>

                <DraggableGrid
                    numColumns={3}
                    data={photos}
                    onDragStart={() => setIsDragging(true)}
                    onDragRelease={(data) => {
                        setPhotos(data);
                        setIsDragging(false);
                    }}
                    renderItem={(item) => {
                        const index = photos.findIndex(
                            photo => photo.key === item.key
                        );

                        const isCover = index === 0;

                        return (
                            <View
                                style={[
                                    styles.photoItem,
                                    isCover && styles.coverPhoto,
                                ]}
                            >
                                <Image
                                    source={{ uri: item.uri }}
                                    style={styles.photo}
                                />

                                {isCover && (
                                    <View style={styles.coverBadge}>
                                        <Ionicons
                                            name="star"
                                            size={12}
                                            color="#FFFFFF"
                                        />
                                        <Text style={styles.coverText}>
                                            Cover
                                        </Text>
                                    </View>
                                )}

                                <Pressable
                                    style={styles.removeButton}
                                    onPress={() => removePhoto(index)}
                                    disabled={saving}
                                >
                                    <Ionicons
                                        name="close"
                                        size={18}
                                        color="#FFFFFF"
                                    />
                                </Pressable>
                            </View>
                        );
                    }}
                />

                <Pressable
                    style={[
                        styles.submitButton,
                        saving && styles.disabledButton,
                    ]}
                    onPress={handleUpdateProduct}
                    disabled={saving}
                >
                    {saving ? (
                        <View style={styles.loadingRow}>
                            <Spinner size="small" color="#FFFFFF" />
                            <Text style={styles.submitText}>
                                {saveMessage}
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.submitText}>
                            Save Changes
                        </Text>
                    )}
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
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    photoButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E8E3DC',
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
    },
    photoButtonText: {
        color: '#92600C',
        fontWeight: '600',
    },
    photoItem: {
        width: 95,
        height: 95,
    },
    photo: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    removeButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#242424',
        borderRadius: 20,
        padding: 3,
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
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },

    photoHint: {
        fontSize: 13,
        color: '#777B83',
        marginBottom: 12,
    },
    coverPhoto: {
        borderWidth: 3,
        borderColor: '#92600C',
        borderRadius: 12,
    },
    coverBadge: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#92600C',
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
    coverText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },

});