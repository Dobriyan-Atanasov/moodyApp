const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function registerUser(
    email,
    password,
    firstName,
    lastName,
    nickname
) {
    const response = await fetch(
        `${SUPABASE_URL}/auth/v1/signup`,
        {
            method: 'POST',
            headers: {
                apikey: SUPABASE_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    nickname: nickname.toLowerCase(),
                },
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.msg ||
            data.error_description ||
            data.message ||
            'Registration failed'
        );
    }

    return data;
}