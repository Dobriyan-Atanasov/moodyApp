const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'moodyapp_refresh_token';

let accessToken = null;
let refreshToken = null;
let expiresAt = 0;

function saveSession(data) {
    accessToken = data.access_token;
    refreshToken = data.refresh_token;
    expiresAt = Date.now() + data.expires_in * 1000;
}

async function requestToken(body) {
    const response = await fetch(
        `${SUPABASE_URL}/auth/v1/token?grant_type=${body.grant_type}`,
        {
            method: 'POST',
            headers: {
                apikey: SUPABASE_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.msg || data.error_description || data.message || 'Authentication failed');
    }

    return data;
}

export async function loginUser(email, password) {
    const data = await requestToken({
        grant_type: 'password',
        email,
        password,
    });

    await SecureStore.setItemAsync(SESSION_KEY, data.refresh_token);
    saveSession(data);

    return data;
}

export async function getAccessToken() {
    if (accessToken && Date.now() < expiresAt - 60000) {
        return accessToken;
    }

    const savedToken =
        refreshToken || await SecureStore.getItemAsync(SESSION_KEY);

    if (!savedToken) return null;

    try {
        const data = await requestToken({
            grant_type: 'refresh_token',
            refresh_token: savedToken,
        });

        await SecureStore.setItemAsync(SESSION_KEY, data.refresh_token);
        saveSession(data);

        return accessToken;
    } catch (error) {
        accessToken = null;
        refreshToken = null;
        expiresAt = 0;
        await SecureStore.deleteItemAsync(SESSION_KEY);
        throw error;
    }
}

export async function getCurrentUser() {
    const token = await getAccessToken();

    if (!token) return null;

    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to load user information.');
    }

    return await response.json();
}

export async function logoutUser() {
    const token = await getAccessToken();

    if (token) {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
            method: 'POST',
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Logout failed.');
        }
    }

    await SecureStore.deleteItemAsync(SESSION_KEY);
    accessToken = null;
    refreshToken = null;
    expiresAt = 0;
}

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