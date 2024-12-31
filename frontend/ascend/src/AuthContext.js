import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [authData, setAuthData] = useState(() => {
        // Load saved data from localStorage on initial load
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        return token && userId ? { token, userId } : null;
    });

    // Save authData to localStorage whenever it changes
    useEffect(() => {
        if (authData) {
            localStorage.setItem('token', authData.token);
            localStorage.setItem('userId', authData.userId);
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
        }
    }, [authData]);

    return (
        <AuthContext.Provider value={{ authData, setAuthData }}>
            {children}
        </AuthContext.Provider>
    );
}