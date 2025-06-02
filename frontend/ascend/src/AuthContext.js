import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [authData, setAuthData] = useState(() => {
        // Load saved data from localStorage on initial load
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');
        return token && userId && username ? { token, userId, username } : null;
    });

    // Save authData to localStorage whenever it changes
    useEffect(() => {
        if (authData) {
            localStorage.setItem('token', authData.token);
            localStorage.setItem('userId', authData.userId);
            localStorage.setItem('username', authData.username);
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
        }
    }, [authData]);

    const clear = () => {
        console.log("Clearing profile");
        setAuthData(null);
        localStorage.clear();
    };

    return (
        <AuthContext.Provider value={{ authData, setAuthData, clear }}>
            {children}
        </AuthContext.Provider>
    );
}