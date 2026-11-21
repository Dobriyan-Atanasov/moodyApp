
import { useState } from 'react';
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

const MAX_PHOTOS = 5;

export default function ProductCreateScreen() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [photos, setPhotos] = useState([]);

    const chooseFromGallery = async () => {
        const remaining = MAX_PHOTOS - photos.length;

        if (remaining === 0) {
            Alert.alert('Photo limit', 'You can add up to 5 photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: remaining,
            quality: 0.8,
        });

        if (!result.canceled) {
            setPhotos((current) => [
                ...current,
                ...result.assets.slice(0, MAX_PHOTOS - current.length),
            ]);
        }
    };

    const takePhoto = async () => {
        if (photos.length >= MAX_PHOTOS) {
            Alert.alert('Photo limit', 'You can add up to 5 photos.');
            return;
        }

        const permission = await ImagePicker.requestCameraPermissionsAsync();

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
            setPhotos((current) => [
                ...current,
                ...result.assets.slice(0, MAX_PHOTOS - current.length),
            ]);
        }
    };

    const removePhoto = (index) => {
        setPhotos((current) =>
            current.filter((_, photoIndex) => photoIndex !== index)
        );
    };

    const handleCreateProduct = () => {
        if (!title.trim() || !price.trim() || !category.trim()) {
            Alert.alert('Missing information', 'Complete the required fields.');
            return;
        }

        const numericPrice = Number(price);

        if (!Number.isFinite(numericPrice) || numericPrice < 0) {
            Alert.alert('Invalid price', 'Enter a valid non-negative price.');
            return;
        }

        if (photos.length === 0) {
            Alert.alert('Missing photos', 'Add at least one product photo.');
            return;
        }

        Alert.alert(
            'Ready for upload',
            'The product is valid. Supabase saving will be connected next.'
        );
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.heading}>Create Product</Text>

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
            <TextInput
                style={styles.input}
                placeholder="Fashion, Technology or Sports"
                value={category}
                onChangeText={setCategory}
            />

            <Text style={styles.label}>
                Product photos ({photos.length}/{MAX_PHOTOS})
            </Text>

            <View style={styles.buttonRow}>
                <Pressable
                    style={styles.photoButton}
                    onPress={chooseFromGallery}
                >
                    <Ionicons name="images-outline" size={24} color="#92600C" />
                    <Text style={styles.photoButtonText}>Gallery</Text>
                </Pressable>

                <Pressable
                    style={styles.photoButton}
                    onPress={takePhoto}
                >
                    <Ionicons name="camera-outline" size={24} color="#92600C" />
                    <Text style={styles.photoButtonText}>Camera</Text>
                </Pressable>
            </View>

            <View style={styles.photoGrid}>
                {photos.map((photo, index) => (
                    <View key={`${photo.uri}-${index}`} style={styles.photoItem}>
                        <Image
                            source={{ uri: photo.uri }}
                            style={styles.photo}
                        />

                        <Pressable
                            style={styles.removeButton}
                            onPress={() => removePhoto(index)}
                        >
                            <Ionicons name="close" size={18} color="#FFFFFF" />
                        </Pressable>
                    </View>
                ))}
            </View>

            <Pressable
                style={styles.submitButton}
                onPress={handleCreateProduct}
            >
                <Text style={styles.submitText}>Create Product</Text>
            </Pressable>
        </ScrollView>
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
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 24,
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
    },
    submitText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});