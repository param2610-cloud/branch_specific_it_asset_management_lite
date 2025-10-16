'use client';
import React, { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';

export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    return (
        <div className="flex h-screen bg-neutral-dark-gray">
            <AuthProvider >
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </AuthProvider>
        </div>
    );
}
