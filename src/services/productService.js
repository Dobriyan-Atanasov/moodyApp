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

export async function getMyProducts(userId) {
    const token = await getAccessToken();

    if (!token) {
        throw new Error('You must be logged in to view your listings.');
    }

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/products?select=*,product_images(storage_path,display_order)&user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc`,
        {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch your listings.');
    }

    const products = await response.json();

    return products.map((product) => ({
        ...product,
        images: [...(product.product_images || [])]
            .sort((a, b) => a.display_order - b.display_order)
            .map((image) =>
                `${SUPABASE_URL}/storage/v1/object/public/product-images/${image.storage_path}`
            ),
    }));
}


export async function getProductById(productId) {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/products?select=*,product_images(id,storage_path,display_order)&id=eq.${encodeURIComponent(productId)}`,
        {
            headers: {
                apikey: SUPABASE_KEY,
            },
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch product.');
    }

    const products = await response.json();
    const product = products[0];

    if (!product) {
        throw new Error('Product not found.');
    }

    const productImages = [...(product.product_images || [])].sort(
        (a, b) => a.display_order - b.display_order
    );

    return {
        ...product,
        product_images: productImages,
        images: productImages.map(
            image =>
                `${SUPABASE_URL}/storage/v1/object/public/product-images/${image.storage_path}`
        ),
    };
}


export async function updateProduct(productId, title, description, price, category, userId) {
    const token = await getAccessToken();

    if (!token) {
        throw new Error('You must be logged in to edit a product.');
    }

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(productId)}&user_id=eq.${encodeURIComponent(userId)}`,
        {
            method: 'PATCH',
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
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to update product.');
    }

    if (data.length === 0) {
        throw new Error('Product not found or you do not have permission to edit it.');
    }

    return data[0];
}


export async function deleteProduct(productId, userId) {
    const token = await getAccessToken();

    if (!token) {
        throw new Error('You must be logged in to delete a product.');
    }

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(productId)}&user_id=eq.${encodeURIComponent(userId)}`,
        {
            method: 'DELETE',
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${token}`,
                Prefer: 'return=representation',
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product.');
    }

    if (data.length === 0) {
        throw new Error('Product not found or deletion is not permitted.');
    }

    return data[0];
}