'use client';

import axios from 'axios';
import React from 'react';
import { motion } from 'framer-motion';
import { ComputerDesktopIcon, UserGroupIcon, ChartBarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User } from '@/interface/user';
import { fixImageUrl } from '@/lib/url';

interface SnipeUser {
    id: number;
    name: string;
    username?: string;
    email?: string;
    avatar?: string;
    assets_count?: number;
}

interface Asset {
    id: number;
    name: string;
    asset_tag: string;
    status_label?: { id: number; name: string; status_meta: string };
    assigned_to?: User;
    location?: { id: number; name: string };
    model?: { id: number; name: string };
}

type RowsResponse<T> = { rows?: T[] };

const extractRows = <T,>(payload: unknown): T[] => {
    if (Array.isArray(payload)) return payload as T[];
    if (payload && typeof payload === 'object' && Array.isArray((payload as RowsResponse<T>)?.rows)) {
        return ((payload as RowsResponse<T>)?.rows ?? []) as T[];
    }
    return [];
};

const DashboardPage = () => {
    const router = useRouter();
    const [assets, setAssets] = React.useState<Asset[]>([]);
    const [users, setUsers] = React.useState<SnipeUser[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [assetsRes, usersRes] = await Promise.all([
                    axios.get('/api/asset', { withCredentials: true }),
                    axios.get('/api/users', { params: { limit: 500 }, withCredentials: true })
                ]);
                const assetsData = extractRows<Asset>(assetsRes.data);
                const usersData = extractRows<SnipeUser>(usersRes.data);
                setAssets(assetsData);
                setUsers(usersData);
            } catch (error) {
                console.error('Failed to load dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        void fetchData();
    }, []);

    const totalAssets = assets.length;
    const deployedAssets = assets.filter(a => a.status_label?.status_meta === 'deployed').length;
    const availableAssets = assets.filter(a => a.status_label?.status_meta !== 'deployed').length;
    const totalUsers = users.length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></motion.div>
                <p className="ml-4 text-gray-300">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 mt-2">Welcome to your IT Asset Management System</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Assets</p>
                            <p className="text-4xl font-bold mt-2">{totalAssets}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl"><ComputerDesktopIcon className="h-8 w-8" /></div>
                    </div>
                    <div className="mt-4">
                        <button onClick={() => router.push('/dashboard/assets')} className="text-sm text-blue-100 hover:text-white transition-colors">View all assets →</button>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Deployed</p>
                            <p className="text-4xl font-bold mt-2">{deployedAssets}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl"><CheckCircleIcon className="h-8 w-8" /></div>
                    </div>
                    <div className="mt-4">
                        <span className="text-sm text-green-100">{totalAssets > 0 ? Math.round((deployedAssets / totalAssets) * 100) : 0}% of total assets</span>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Available</p>
                            <p className="text-4xl font-bold mt-2">{availableAssets}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl"><XCircleIcon className="h-8 w-8" /></div>
                    </div>
                    <div className="mt-4"><span className="text-sm text-orange-100">Ready to deploy</span></div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Total Users</p>
                            <p className="text-4xl font-bold mt-2">{totalUsers}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl"><UserGroupIcon className="h-8 w-8" /></div>
                    </div>
                    <div className="mt-4">
                        <button onClick={() => router.push('/dashboard/users')} className="text-sm text-purple-100 hover:text-white transition-colors">View all users →</button>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-gray-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Recent Assets</h2>
                        <button onClick={() => router.push('/dashboard/assets')} className="text-blue-400 hover:text-blue-300 text-sm font-medium">View All</button>
                    </div>
                    <div className="space-y-3">
                        {assets.slice(0, 5).map((asset) => (
                            <motion.div key={asset.id} whileHover={{ scale: 1.01 }} onClick={() => router.push(`/dashboard/assets/${asset.id}`)} className="bg-gray-700/50 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-semibold truncate">{asset.name}</h3>
                                        <p className="text-gray-400 text-sm truncate">{asset.model?.name}</p>
                                    </div>
                                    <div className="ml-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${asset.status_label?.status_meta === 'deployed' ? 'bg-green-500/20 text-green-400' : 'bg-gray-600 text-gray-300'}`}>{asset.status_label?.name || 'Unknown'}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {assets.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <ComputerDesktopIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No assets found</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-gray-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Recent Users</h2>
                        <button onClick={() => router.push('/dashboard/users')} className="text-blue-400 hover:text-blue-300 text-sm font-medium">View All</button>
                    </div>
                    <div className="space-y-3">
                        {users.slice(0, 5).map((user) => (
                            <motion.div key={user.id} whileHover={{ scale: 1.01 }} onClick={() => router.push(`/dashboard/users/${user.id}`)} className="bg-gray-700/50 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition-all">
                                <div className="flex items-center gap-4">
                                    {user.avatar ? (
                                        <Image src={fixImageUrl(user.avatar)} alt={user.name} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                            <span className="text-white font-bold">{user.name?.charAt(0)?.toUpperCase() || '?'}</span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-semibold truncate">{user.name}</h3>
                                        <p className="text-gray-400 text-sm truncate">{user.email || user.username}</p>
                                    </div>
                                    {typeof user.assets_count === 'number' && user.assets_count > 0 && (
                                        <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-medium">{user.assets_count} {user.assets_count === 1 ? 'Asset' : 'Assets'}</div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        {users.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <UserGroupIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No users found</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-gray-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => router.push('/dashboard/assets')} className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl p-6 text-left transition-all group">
                        <ComputerDesktopIcon className="h-8 w-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="text-white font-semibold mb-1">View Assets</h3>
                        <p className="text-gray-400 text-sm">Browse and manage all assets</p>
                    </button>
                    <button onClick={() => router.push('/dashboard/users')} className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl p-6 text-left transition-all group">
                        <UserGroupIcon className="h-8 w-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="text-white font-semibold mb-1">View Users</h3>
                        <p className="text-gray-400 text-sm">Manage system users</p>
                    </button>
                    <button onClick={() => router.push('/dashboard')} className="bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl p-6 text-left transition-all group">
                        <ChartBarIcon className="h-8 w-8 text-orange-400 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="text-white font-semibold mb-1">Reports</h3>
                        <p className="text-gray-400 text-sm">View analytics and reports</p>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default DashboardPage;
