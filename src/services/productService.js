const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function getProducts() {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/products?select=*`,
        {
            headers: {
                apikey: SUPABASE_KEY,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
    }

    return await response.json();
}