const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
import { getAccessToken } from './authService';


export async function getProducts() {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/products?select=*,product_images(storage_path,display_order)&order=created_at.desc`,
        {
            headers: {
                apikey: SUPABASE_KEY,
            },
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch products.');
    }

    const products = await response.json();

    return products.map((product) => {
        const images = [...(product.product_images || [])]
            .sort((a, b) => a.display_order - b.display_order);

        return {
            ...product,
            images: images.map((image) =>
                `${SUPABASE_URL}/storage/v1/object/public/product-images/${image.storage_path}`
            ),
        };
    });
}

export async function createProduct(title, description, price, category, userId) {
    const token = await getAccessToken();

    if (!token) {
        throw new Error('You must be logged in to create a product.');
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
        },
        body: JSON.stringify({
            title,
            description,
            price,
            category,
            user_id: userId,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to create product.');
    }

    return data[0];
}