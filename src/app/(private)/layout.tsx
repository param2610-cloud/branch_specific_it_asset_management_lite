'use client';
import React, { useEffect, useContext } from 'react';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';

export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const auth = useContext(AuthContext);

    useEffect(() => {
        if (!auth?.loading && !auth?.user) {
            router.push('/login');
        }
    }, [auth?.loading, auth?.user, router]);

    if (auth?.loading) {
        return <div>Loading...</div>; // Or a proper loading component
    }

    if (!auth?.user) {
        return null; // Will redirect
    }

    return (
        <div className="flex h-screen bg-neutral-dark-gray">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
