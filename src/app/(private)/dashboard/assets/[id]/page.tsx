'use client';

import axios from 'axios';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeftIcon, 
    ComputerDesktopIcon, 
    BuildingOffice2Icon, 
    UserCircleIcon, 
    CalendarIcon, 
    TagIcon,
    CurrencyDollarIcon,
    ClockIcon,
    InformationCircleIcon,
    PencilIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { User } from '@/interface/user';
import { fixImageUrl } from '@/lib/url';

interface Asset {
    id: number;
    name: string;
    asset_tag: string;
    serial: string;
    model: { id: number; name: string };
    status_label: { id: number; name: string; status_meta: string };
    category: { id: number; name: string };
    manufacturer: { id: number; name: string };
    supplier: { id: number; name: string } | null;
    company: { id: number; name: string };
    location: { id: number; name: string };
    rtd_location: { id: number; name: string };
    assigned_to: User | null;
    notes: string;
    purchase_date: string | { date: string; formatted: string } | null;
    purchase_cost: number | null;
    warranty_months: number | null;
    warranty_expires: string | { date: string; formatted: string } | null;
    created_at: { datetime: string; formatted: string };
    updated_at: { datetime: string; formatted: string };
    last_checkout: string | { datetime: string; formatted: string } | null;
    expected_checkin: string | { datetime: string; formatted: string } | null;
    checkin_counter: number;
    checkout_counter: number;
    image: string | null;
    custom_fields: Record<string, unknown>;
}

interface StatusLabel {
    id: number;
    name: string;
    status_meta: string;
}

const AssetDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const assetId = params?.id as string;
    
    const [asset, setAsset] = React.useState<Asset | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);
    const [statusLabels, setStatusLabels] = React.useState<StatusLabel[]>([]);
    const [showStatusModal, setShowStatusModal] = React.useState<boolean>(false);
    const [selectedStatus, setSelectedStatus] = React.useState<number | null>(null);
    const [updateLoading, setUpdateLoading] = React.useState<boolean>(false);
    const [updateMessage, setUpdateMessage] = React.useState<string | null>(null);
    const [updateError, setUpdateError] = React.useState<string | null>(null);

    const fetchAssetDetails = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/hardware/${assetId}`, {
                withCredentials: true,
            });
            
            if (response.data && typeof response.data === 'object') {
                setAsset(response.data);
            }
        } catch (err) {
            console.error('Failed to load asset details', err);
            setError('Unable to fetch asset details. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [assetId]);

    React.useEffect(() => {
        if (assetId) {
            void fetchAssetDetails();
        }
    }, [assetId, fetchAssetDetails]);

    React.useEffect(() => {
        const fetchStatusLabels = async () => {
            try {
                const response = await axios.get('/api/status-labels', {
                    params: { limit: 200 },
                    withCredentials: true,
                });
                const rows = Array.isArray(response.data) 
                    ? response.data 
                    : response.data?.rows || [];
                setStatusLabels(rows);
            } catch (err) {
                console.error('Failed to load status labels', err);
            }
        };
        void fetchStatusLabels();
    }, []);

    const handleStatusChange = async () => {
        if (!selectedStatus) {
            setUpdateError('Please select a status');
            return;
        }

        setUpdateLoading(true);
        setUpdateError(null);
        setUpdateMessage(null);

        try {
            await axios.patch(`/api/hardware/${assetId}`, 
                { status_id: selectedStatus },
                { withCredentials: true }
            );
            
            setUpdateMessage('Asset status updated successfully!');
            setShowStatusModal(false);
            
            // Refresh asset details
            await fetchAssetDetails();
            
            setTimeout(() => {
                setUpdateMessage(null);
            }, 3000);
        } catch (err: unknown) {
            console.error('Failed to update status', err);
            const errorMessage = axios.isAxiosError(err) ? err.response?.data || 'Failed to update asset status' : 'Failed to update asset status';
            setUpdateError(errorMessage);
        } finally {
            setUpdateLoading(false);
        }
    };

    React.useEffect(() => {
        const fetchAssetDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`/api/hardware/${assetId}`, {
                    withCredentials: true,
                });
                
                if (response.data && typeof response.data === 'object') {
                    setAsset(response.data);
                }
            } catch (err) {
                console.error('Failed to load asset details', err);
                setError('Unable to fetch asset details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (assetId) {
            void fetchAssetDetails();
        }
    }, [assetId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"
                ></motion.div>
                <p className="ml-4 text-gray-300">Loading Asset Details...</p>
            </div>
        );
    }

    if (error || !asset) {
        return (
            <div className="p-6">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                    <p>{error || 'Asset not found'}</p>
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

    const isDeployed = asset.status_label?.status_meta === 'deployed';

    return (
        <div className="space-y-6 p-6">
            {/* Success/Error Messages */}
            <AnimatePresence>
                {updateMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-md flex items-center"
                    >
                        <CheckCircleIcon className="h-6 w-6 mr-3"/>
                        {updateMessage}
                    </motion.div>
                )}

                {updateError && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md flex items-center"
                    >
                        <XCircleIcon className="h-6 w-6 mr-3"/>
                        {updateError}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <h1 className="text-3xl font-bold text-white">Asset Details</h1>
                </div>
                <button
                    onClick={() => {
                        setSelectedStatus(asset.status_label?.id || null);
                        setShowStatusModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                    <PencilIcon className="h-5 w-5" />
                    Change Status
                </button>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800 rounded-2xl p-6 shadow-xl"
                    >
                        <div
                            className="p-6 rounded-xl mb-6"
                            style={{
                                background: isDeployed
                                    ? 'linear-gradient(135deg, rgba(21,94,117,0.95), rgba(249,115,22,0.85))'
                                    : 'linear-gradient(135deg, rgba(17,24,39,0.9), rgba(31,41,55,0.85))',
                            }}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">{asset.name}</h2>
                                    <p className="text-gray-200 text-sm">{asset.model?.name}</p>
                                </div>
                                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-mono">
                                    {asset.asset_tag}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoRow icon={TagIcon} label="Serial Number" value={asset.serial || 'N/A'} />
                            <InfoRow icon={ComputerDesktopIcon} label="Status" value={asset.status_label?.name} />
                            <InfoRow icon={BuildingOffice2Icon} label="Location" value={asset.location?.name} />
                            <InfoRow icon={BuildingOffice2Icon} label="RTD Location" value={asset.rtd_location?.name} />
                            {isDeployed && asset.assigned_to && typeof asset.assigned_to === 'object' && 'name' in asset.assigned_to && (
                                <InfoRow 
                                    icon={UserCircleIcon} 
                                    label="Assigned To" 
                                    value={(asset.assigned_to as { name: string })?.name} 
                                />
                            )}
                            <InfoRow icon={InformationCircleIcon} label="Category" value={asset.category?.name} />
                            <InfoRow icon={InformationCircleIcon} label="Manufacturer" value={asset.manufacturer?.name} />
                            <InfoRow icon={InformationCircleIcon} label="Company" value={asset.company?.name} />
                        </div>
                    </motion.div>

                    {/* Purchase & Warranty Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-800 rounded-2xl p-6 shadow-xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">Purchase & Warranty</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoRow 
                                icon={CalendarIcon} 
                                label="Purchase Date" 
                                value={
                                    asset.purchase_date 
                                        ? (typeof asset.purchase_date === 'string' 
                                            ? asset.purchase_date 
                                            : (asset.purchase_date as unknown as { formatted: string }).formatted || (asset.purchase_date as unknown as { date: string }).date)
                                        : 'N/A'
                                } 
                            />
                            <InfoRow 
                                icon={CurrencyDollarIcon} 
                                label="Purchase Cost" 
                                value={asset.purchase_cost ? `₹${asset.purchase_cost}` : 'N/A'} 
                            />
                            <InfoRow 
                                icon={CalendarIcon} 
                                label="Warranty Expires" 
                                value={
                                    asset.warranty_expires 
                                        ? (typeof asset.warranty_expires === 'string' 
                                            ? asset.warranty_expires 
                                            : (asset.warranty_expires as unknown as { formatted: string }).formatted || (asset.warranty_expires as unknown as { date: string }).date)
                                        : 'N/A'
                                } 
                            />
                            <InfoRow 
                                icon={InformationCircleIcon} 
                                label="Warranty (Months)" 
                                value={asset.warranty_months?.toString() || 'N/A'} 
                            />
                            {asset.supplier && (
                                <InfoRow 
                                    icon={InformationCircleIcon} 
                                    label="Supplier" 
                                    value={asset.supplier.name} 
                                />
                            )}
                        </div>
                    </motion.div>

                    {/* Notes */}
                    {asset.notes && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gray-800 rounded-2xl p-6 shadow-xl"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Notes</h3>
                            <p className="text-gray-300 whitespace-pre-wrap">{asset.notes}</p>
                        </motion.div>
                    )}
                </div>

                {/* Right Column - Stats & Activity */}
                <div className="space-y-6">
                    {/* Activity Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-800 rounded-2xl p-6 shadow-xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">Activity</h3>
                        <div className="space-y-4">
                            <StatBox label="Checkouts" value={asset.checkout_counter} />
                            <StatBox label="Checkins" value={asset.checkin_counter} />
                            {asset.last_checkout && (
                                <InfoRow 
                                    icon={ClockIcon} 
                                    label="Last Checkout" 
                                    value={typeof asset.last_checkout === 'string' 
                                        ? asset.last_checkout 
                                        : asset.last_checkout.formatted} 
                                />
                            )}
                            {asset.expected_checkin && (
                                <InfoRow 
                                    icon={CalendarIcon} 
                                    label="Expected Checkin" 
                                    value={typeof asset.expected_checkin === 'string' 
                                        ? asset.expected_checkin 
                                        : asset.expected_checkin.formatted} 
                                />
                            )}
                        </div>
                    </motion.div>

                    {/* Timestamps */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-800 rounded-2xl p-6 shadow-xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">Timestamps</h3>
                        <div className="space-y-4">
                            <InfoRow 
                                icon={CalendarIcon} 
                                label="Created" 
                                value={asset.created_at?.formatted || 'N/A'} 
                            />
                            <InfoRow 
                                icon={CalendarIcon} 
                                label="Last Updated" 
                                value={asset.updated_at?.formatted || 'N/A'} 
                            />
                        </div>
                    </motion.div>

                    {/* Image */}
                    {asset.image && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gray-800 rounded-2xl p-6 shadow-xl"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Image</h3>
                            <div className="relative w-full h-64">
                                <Image 
                                    src={fixImageUrl(asset.image)} 
                                    alt={asset.name} 
                                    fill
                                    className="object-cover rounded-lg"
                                />
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Status Change Modal */}
            <AnimatePresence>
                {showStatusModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowStatusModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold text-white mb-4">Change Asset Status</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-gray-300 text-sm font-medium mb-2 block">
                                        Current Status: <span className="text-blue-400">{asset.status_label?.name}</span>
                                    </label>
                                    <select
                                        value={selectedStatus || ''}
                                        onChange={(e) => setSelectedStatus(Number(e.target.value))}
                                        className="w-full rounded-xl border border-gray-600 bg-gray-700 text-white p-3 focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="">Select new status...</option>
                                        {statusLabels.map((status) => (
                                            <option key={status.id} value={status.id}>
                                                {status.name} ({status.status_meta})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {updateError && (
                                    <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm">
                                        {updateError}
                                    </div>
                                )}

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={handleStatusChange}
                                        disabled={updateLoading || !selectedStatus}
                                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {updateLoading ? 'Updating...' : 'Update Status'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowStatusModal(false);
                                            setUpdateError(null);
                                        }}
                                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const InfoRow: React.FC<{ icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; value: string }> = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
            <p className="text-gray-400 text-sm">{label}</p>
            <p className="text-white font-medium">{value}</p>
        </div>
    </div>
);

const StatBox: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="bg-gray-700/50 rounded-lg p-4">
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
    </div>
);

export default AssetDetailsPage;
