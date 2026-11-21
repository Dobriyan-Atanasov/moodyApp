import { getAccessToken } from './authService';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

async function getAuthHeaders() {
    const token = await getAccessToken();

    if (!token) {
        throw new Error('You must be logged in to manage favorites.');
    }

    return {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
}

export async function getFavorites(userId) {
    const headers = await getAuthHeaders();

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/favorites?select=product_id&user_id=eq.${encodeURIComponent(userId)}`,
        { headers }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch favorites.');
    }

    const favorites = await response.json();

    return favorites.map((favorite) => favorite.product_id);
}

export async function addFavorite(productId, userId) {
    const headers = await getAuthHeaders();

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/favorites`,
        {
            method: 'POST',
            headers,
            body: JSON.stringify({
                product_id: productId,
                user_id: userId,
            }),
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add favorite.');
    }
}

export async function removeFavorite(productId, userId) {
    const headers = await getAuthHeaders();

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/favorites?product_id=eq.${encodeURIComponent(productId)}&user_id=eq.${encodeURIComponent(userId)}`,
        {
            method: 'DELETE',
            headers,
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to remove favorite.');
    }
}