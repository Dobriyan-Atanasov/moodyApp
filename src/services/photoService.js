
import { File } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';
import { getAccessToken } from './authService';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function uploadProductPhoto(photo, productId, userId, index) {
    const token = await getAccessToken();

    if (!token) {
        throw new Error('You must be logged in to upload photos.');
    }

    const file = new File(photo.uri);
    const mimeType = photo.mimeType || file.type || 'image/jpeg';

    const extension = mimeType === 'image/png'
        ? 'png'
        : mimeType === 'image/webp'
            ? 'webp'
            : 'jpg';

    const storagePath =
        `${userId}/${productId}/${Date.now()}-${index}.${extension}`;

    const response = await expoFetch(
        `${SUPABASE_URL}/storage/v1/object/product-images/${storagePath}`,
        {
            method: 'POST',
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${token}`,
                'Content-Type': mimeType,
            },
            body: file,
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.error || 'Photo upload failed.');
    }

    return storagePath;
}


export async function saveProductPhoto(productId, storagePath, displayOrder) {
    const token = await getAccessToken();

    if (!token) {
        throw new Error('You must be logged in to save photos.');
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/product_images`, {
        method: 'POST',
        headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            product_id: productId,
            storage_path: storagePath,
            display_order: displayOrder,
        }),
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save product photo.');
    }
}