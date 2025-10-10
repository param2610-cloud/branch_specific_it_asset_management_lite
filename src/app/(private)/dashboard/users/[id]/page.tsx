'use client';

import axios from 'axios';
import React from 'react';
import { motion } from 'framer-motion';
import { 
    ArrowLeftIcon,
    UserCircleIcon,
    EnvelopeIcon,
    PhoneIcon,
    BuildingOfficeIcon,
    BriefcaseIcon,
    CalendarIcon,
    ComputerDesktopIcon,
    IdentificationIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';
import { useRouter, useParams } from 'next/navigation';

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
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
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
    updated_at?: {
        datetime: string;
        formatted: string;
    };
    notes?: string;
}

interface UserAsset {
    id: number;
    name: string;
    asset_tag: string;
    serial?: string;
    model?: {
        id: number;
        name: string;
    };
    status_label?: {
        id: number;
        name: string;
        status_meta: string;
    };
    category?: {
        id: number;
        name: string;
    };
    assigned_to?: any;
    image?: string;
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

const UserDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const userId = params?.id as string;
    
    const [user, setUser] = React.useState<SnipeUser | null>(null);
    const [assets, setAssets] = React.useState<UserAsset[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [assetsLoading, setAssetsLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchUserDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`/api/users/${userId}`, {
                    withCredentials: true,
                });
                
                if (response.data && typeof response.data === 'object') {
                    setUser(response.data);
                }
            } catch (err) {
                console.error('Failed to load user details', err);
                setError('Unable to fetch user details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            void fetchUserDetails();
        }
    }, [userId]);

    React.useEffect(() => {
        const fetchUserAssets = async () => {
            setAssetsLoading(true);
            try {
                const response = await axios.get(`/api/users/${userId}/hardware`, {
                    withCredentials: true,
                });
                
                if (response.data) {
                    const rows = extractRows<UserAsset>(response.data);
                    setAssets(rows);
                }
            } catch (err) {
                console.error('Failed to load user assets', err);
            } finally {
                setAssetsLoading(false);
            }
        };

        if (userId && user) {
            void fetchUserAssets();
        }
    }, [userId, user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"
                ></motion.div>
                <p className="ml-4 text-gray-300">Loading User Details...</p>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="p-6">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                    <p>{error || 'User not found'}</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="mt-4 btn-primary"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <h1 className="text-3xl font-bold text-white">User Profile</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - User Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* User Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800 rounded-2xl p-6 shadow-xl"
                    >
                        {/* Avatar */}
                        <div className="flex flex-col items-center mb-6">
                            {user.avatar ? (
                                <img 
                                    src={user.avatar} 
                                    alt={user.name}
                                    className="h-24 w-24 rounded-full object-cover mb-4"
                                />
                            ) : (
                                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                                    <span className="text-white font-bold text-3xl">
                                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                                    </span>
                                </div>
                            )}
                            <h2 className="text-2xl font-bold text-white text-center">{user.name}</h2>
                            {user.username && (
                                <p className="text-gray-400 text-sm mt-1">@{user.username}</p>
                            )}
                            {user.jobtitle && (
                                <p className="text-blue-400 text-sm mt-2">{user.jobtitle}</p>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-3 border-t border-gray-700 pt-4">
                            {user.email && (
                                <InfoRow icon={EnvelopeIcon} label="Email" value={user.email} />
                            )}
                            {user.phone && (
                                <InfoRow icon={PhoneIcon} label="Phone" value={user.phone} />
                            )}
                            {user.employee_num && (
                                <InfoRow icon={IdentificationIcon} label="Employee #" value={user.employee_num} />
                            )}
                        </div>
                    </motion.div>

                    {/* Organization Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-800 rounded-2xl p-6 shadow-xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">Organization</h3>
                        <div className="space-y-3">
                            {user.company && (
                                <InfoRow icon={BuildingOfficeIcon} label="Company" value={user.company.name} />
                            )}
                            {user.department && (
                                <InfoRow icon={BriefcaseIcon} label="Department" value={user.department.name} />
                            )}
                            {user.location && (
                                <InfoRow icon={MapPinIcon} label="Location" value={user.location.name} />
                            )}
                            {user.manager && (
                                <InfoRow icon={UserCircleIcon} label="Manager" value={user.manager.name} />
                            )}
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gray-800 rounded-2xl p-6 shadow-xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">Stats</h3>
                        <div className="space-y-3">
                            {typeof user.assets_count === 'number' && (
                                <StatRow label="Assets" value={user.assets_count} />
                            )}
                            {typeof user.licenses_count === 'number' && (
                                <StatRow label="Licenses" value={user.licenses_count} />
                            )}
                            {typeof user.accessories_count === 'number' && (
                                <StatRow label="Accessories" value={user.accessories_count} />
                            )}
                            {typeof user.consumables_count === 'number' && (
                                <StatRow label="Consumables" value={user.consumables_count} />
                            )}
                        </div>
                    </motion.div>

                    {/* Timestamps */}
                    {(user.created_at || user.updated_at) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gray-800 rounded-2xl p-6 shadow-xl"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Account Info</h3>
                            <div className="space-y-3">
                                {user.created_at && (
                                    <InfoRow icon={CalendarIcon} label="Created" value={user.created_at.formatted} />
                                )}
                                {user.updated_at && (
                                    <InfoRow icon={CalendarIcon} label="Updated" value={user.updated_at.formatted} />
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Right Column - Assigned Assets */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-800 rounded-2xl p-6 shadow-xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-white">Assigned Assets</h3>
                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                                {assets.length} {assets.length === 1 ? 'Asset' : 'Assets'}
                            </span>
                        </div>

                        {assetsLoading ? (
                            <div className="text-center py-10">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full inline-block"
                                ></motion.div>
                                <p className="mt-4 text-gray-400">Loading assets...</p>
                            </div>
                        ) : assets.length === 0 ? (
                            <div className="text-center py-20">
                                <ComputerDesktopIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">No assets assigned to this user.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {assets.map((asset) => (
                                    <motion.div
                                        key={asset.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ scale: 1.01 }}
                                        onClick={() => router.push(`/dashboard/assets/${asset.id}`)}
                                        className="bg-gray-700/50 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition-all border border-gray-600 hover:border-blue-500"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Asset Image or Icon */}
                                            <div className="flex-shrink-0">
                                                {asset.image ? (
                                                    <img 
                                                        src={asset.image} 
                                                        alt={asset.name}
                                                        className="h-16 w-16 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                                                        <ComputerDesktopIcon className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Asset Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <h4 className="text-white font-semibold text-lg">{asset.name}</h4>
                                                    <span className="bg-gray-600 text-gray-300 px-2 py-1 rounded text-xs font-mono flex-shrink-0">
                                                        {asset.asset_tag}
                                                    </span>
                                                </div>
                                                
                                                <div className="space-y-1">
                                                    {asset.model && (
                                                        <p className="text-gray-400 text-sm">{asset.model.name}</p>
                                                    )}
                                                    {asset.serial && (
                                                        <p className="text-gray-500 text-xs">Serial: {asset.serial}</p>
                                                    )}
                                                    {asset.category && (
                                                        <p className="text-gray-500 text-xs">Category: {asset.category.name}</p>
                                                    )}
                                                    {asset.status_label && (
                                                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                                            asset.status_label.status_meta === 'deployed' 
                                                                ? 'bg-green-500/20 text-green-400' 
                                                                : 'bg-gray-600/50 text-gray-400'
                                                        }`}>
                                                            {asset.status_label.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Notes Section */}
                    {user.notes && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gray-800 rounded-2xl p-6 shadow-xl mt-6"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Notes</h3>
                            <p className="text-gray-300 whitespace-pre-wrap">{user.notes}</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoRow: React.FC<{ icon: any; label: string; value: string }> = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-xs">{label}</p>
            <p className="text-white text-sm break-words">{value}</p>
        </div>
    </div>
);

const StatRow: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-white font-bold text-lg">{value}</span>
    </div>
);

export default UserDetailPage;
