'use client';
import React, { createContext, useState, useEffect } from "react";
import { User } from "@/interface/user";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null)

function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    console.log('AuthProvider rendered, loading:', loading, 'user:', user); 

    useEffect(() => {
        fetch('/api/auth/user', {
            credentials: 'include', // Include cookies in the request
            cache: 'no-store'
        })
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setUser(data.user);
                }
            })
            .catch(err => console.error('Failed to fetch user:', err))
            .finally(() => setLoading(false));
    }, []);

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
                cache: 'no-store'
            });
            if (typeof window !== 'undefined') {
                document.cookie = 'accessToken=; Max-Age=0; path=/';
            }
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const value = { user, loading, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )   
}

export { AuthContext, AuthProvider };