'use client';
import React, { createContext, useState, useEffect } from "react";
import { User } from "@/interface/user";

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null)

function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    console.log('AuthProvider rendered, loading:', loading, 'user:', user); 

    useEffect(() => {
        fetch('/api/auth/user', {
            credentials: 'include' // Include cookies in the request
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

    const value = { user, loading };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )   
}

export { AuthContext, AuthProvider };