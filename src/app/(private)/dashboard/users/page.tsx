'use client';

import axios from 'axios';
import React from 'react';
import { motion } from 'framer-motion';
import { 
    UserCircleIcon, 
    EnvelopeIcon, 
    BuildingOfficeIcon,
    MagnifyingGlassIcon,
    ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface SnipeUser {
    id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    email?: string;
    employee_num?: string;
    avatar?: string;
    jobtitle?: string;
    phone?: string;
    location?: {
        id: number;
        name: string;
    };
    department?: {
        id: number;
        name: string;
    };
    company?: {
        id: number;
        name: string;
    };
    manager?: {
        id: number;
        name: string;
    };
    assets_count?: number;
    licenses_count?: number;
    accessories_count?: number;
    consumables_count?: number;
    created_at?: {
        datetime: string;
        formatted: string;
    };
}

type RowsResponse<T> = {
    rows?: T[];
};

const extractRows = <T,>(payload: unknown): T[] => {
    if (Array.isArray(payload)) {
        return payload as T[];
    }
    if (payload && typeof payload === 'object' && Array.isArray((payload as RowsResponse<T>)?.rows)) {
        return ((payload as RowsResponse<T>)?.rows ?? []) as T[];
    }
    return [];
};

const UsersPage = () => {
    const router = useRouter();
    const [users, setUsers] = React.useState<SnipeUser[]>([]);
    const [filteredUsers, setFilteredUsers] = React.useState<SnipeUser[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);
    const [searchQuery, setSearchQuery] = React.useState<string>('');

    const fetchUsers = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/users', {
                params: { limit: 500 },
                withCredentials: true,
            });

            if (response.data && typeof response.data === 'object' && 'success' in response.data && !response.data.success) {
                throw new Error(response.data.error || 'API Error');
            }

            const rows = extractRows<SnipeUser>(response.data);
            setUsers(rows);
            setFilteredUsers(rows);
        } catch (err) {
            console.error('Failed to load users', err);
            setError('Unable to fetch users. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        void fetchUsers();
    }, [fetchUsers]);

    React.useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredUsers(users);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = users.filter(user => 
                user.name?.toLowerCase().includes(query) ||
                user.username?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query) ||
                user.employee_num?.toLowerCase().includes(query) ||
                user.jobtitle?.toLowerCase().includes(query)
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery, users]);

    const handleUserClick = (userId: number) => {
        router.push(`/dashboard/users/${userId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"
                ></motion.div>
                <p className="ml-4 text-gray-300">Loading Users...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Users</h1>
                <div className="text-gray-400">
                    {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search users by name, username, email, employee number, or job title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
            </div>

            {/* Users List */}
            {filteredUsers.length === 0 ? (
                <div className="text-center py-20 bg-gray-800 rounded-xl">
                    <UserCircleIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">
                        {searchQuery ? 'No users found matching your search.' : 'No users found.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map((user) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handleUserClick(user.id)}
                            className="bg-gray-800 rounded-xl p-5 shadow-lg cursor-pointer hover:bg-gray-750 transition-all border border-gray-700 hover:border-blue-500"
                        >
                            {/* User Avatar and Name */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex-shrink-0">
                                    {user.avatar ? (
                                        <img 
                                            src={user.avatar} 
                                            alt={user.name}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">
                                                {user.name?.charAt(0)?.toUpperCase() || '?'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-semibold text-lg truncate">
                                        {user.name}
                                    </h3>
                                    {user.username && (
                                        <p className="text-gray-400 text-sm truncate">
                                            @{user.username}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* User Details */}
                            <div className="space-y-2">
                                {user.email && (
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <EnvelopeIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                )}
                                
                                {user.jobtitle && (
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <BuildingOfficeIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                        <span className="truncate">{user.jobtitle}</span>
                                    </div>
                                )}

                                {user.location && (
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <BuildingOfficeIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                        <span className="truncate">{user.location.name}</span>
                                    </div>
                                )}

                                {/* Assets Count */}
                                {typeof user.assets_count === 'number' && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <ComputerDesktopIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                                        <span className="text-blue-400 font-medium">
                                            {user.assets_count} {user.assets_count === 1 ? 'Asset' : 'Assets'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Employee Number Badge */}
                            {user.employee_num && (
                                <div className="mt-3 pt-3 border-t border-gray-700">
                                    <span className="text-xs text-gray-500">Employee #</span>
                                    <span className="ml-2 text-xs font-mono text-gray-300">{user.employee_num}</span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UsersPage;
