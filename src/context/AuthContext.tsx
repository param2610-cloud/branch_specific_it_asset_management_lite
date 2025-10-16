'use client';
import React, { createContext, useState, useEffect, useCallback } from "react";
import { User } from "@/interface/user";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<User | null>;
    setAuthenticatedUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null)

function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async (): Promise<User | null> => {
        setLoading(true);
        try {
            const response = await fetch('/api/auth/user', {
                credentials: 'include',
                cache: 'no-store'
            });

            if (!response.ok) {
                setUser(null);
                return null;
            }

            const data = await response.json();
            const fetchedUser = (data.user ?? null) as User | null;
            setUser(fetchedUser);
            return fetchedUser;
        } catch (error) {
            console.error('Failed to fetch user:', error);
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const setAuthenticatedUser = useCallback((authenticatedUser: User | null) => {
        setUser(authenticatedUser);
        setLoading(false);
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

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
            setAuthenticatedUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const value = { user, loading, logout, refreshUser, setAuthenticatedUser };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )   
}

export { AuthContext, AuthProvider };