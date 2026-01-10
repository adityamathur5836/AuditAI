import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, fetchCurrentUser } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(false); // Initial load can be false, we just check token

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const userData = await fetchCurrentUser();
                    setUser(userData);
                } catch (error) {
                    console.error("Token invalid or expired", error);
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, [token]);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const data = await loginUser(email, password);
            localStorage.setItem('token', data.access_token);
            setToken(data.access_token);
            setUser({ email });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const register = async (email, password, fullName) => {
        setLoading(true);
        try {
            await registerUser(email, password, fullName);
            // Auto login after register? Or require login
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
