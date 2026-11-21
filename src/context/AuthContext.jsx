import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';

import {
    getCurrentUser,
    loginUser,
    logoutUser,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.log('Session restore error:', error.message);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = async (email, password) => {
        const data = await loginUser(email, password);
        setUser(data.user);
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }

    return context;
}