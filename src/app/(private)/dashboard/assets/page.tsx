'use client';

import axios, { isAxiosError } from 'axios';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BuildingOffice2Icon, CheckCircleIcon, ComputerDesktopIcon, ExclamationTriangleIcon, InformationCircleIcon, UserCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { EyeIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

type ActionType = 'checkout' | 'checkin';

interface SnipeUserSummary {
    id: number;
    name: string;
    username?: string;
    email?: string;
}

interface SnipeLocationSummary {
    id: number;
    name: string;
}

interface SnipeStatusLabelSummary {
    id: number;
    name: string;
    status_meta?: string;
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

const extractApiErrorMessage = (error: unknown): string => {
    if (isAxiosError(error)) {
        const data = error.response?.data as any;
        const fallback = error.message || 'Request failed.';
        if (!data) {
            return fallback;
        }

        if (typeof data === 'string') {
            return data;
        }

        const parts: string[] = [];

        if (typeof data.message === 'string') {
            parts.push(data.message);
        }

        if (typeof data.error === 'string') {
            parts.push(data.error);
        }

        if (data.messages && typeof data.messages === 'object') {
            const details = Object.entries(data.messages as Record<string, unknown>)
                .flatMap(([field, value]) => {
                    if (Array.isArray(value)) {
                        return value.map((item) => `${field}: ${String(item)}`);
                    }
                    return `${field}: ${String(value)}`;
                });
            if (details.length) {
                parts.push(details.join(' | '));
            }
        }

        return parts.filter(Boolean).join(' - ') || fallback;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred.';
};

const formatDateTimeForSnipe = (input: string | Date): string | null => {
    const date = typeof input === 'string' ? new Date(input) : input;
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const pad = (value: number) => value.toString().padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

interface CheckoutPayload {
    assigned_to: number;
    checkout_to_type: 'user';
    assigned_user?: number;
    assigned_asset?: number;
    assigned_location?: number;
    location_id?: number;
    status_id?: number;
    expected_checkin?: string;
    note?: string;
    name?: string;
    checkout_at?: string;
}

interface CheckinPayload {
    location_id: number;
    status_id?: number;
    note?: string;
}

const AssetsPage = () => {
    const router = useRouter();
    const [assets, setAssets] = React.useState<Asset[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [users, setUsers] = React.useState<SnipeUserSummary[]>([]);
    const [usersLoading, setUsersLoading] = React.useState<boolean>(false);
    const [locations, setLocations] = React.useState<SnipeLocationSummary[]>([]);
    const [locationsLoading, setLocationsLoading] = React.useState<boolean>(false);
    const [statusLabels, setStatusLabels] = React.useState<SnipeStatusLabelSummary[]>([]);
    const [statusLabelsLoading, setStatusLabelsLoading] = React.useState<boolean>(false);
    const [actionState, setActionState] = React.useState<{ assetId: number | null; action: ActionType | null }>({ assetId: null, action: null });
    const [checkoutForm, setCheckoutForm] = React.useState({ assigned_to: '', status_id: '', expected_checkin: '', note: '' });
    const [checkinForm, setCheckinForm] = React.useState({ note: '', location_id: '', status_id: '' });
    const [actionLoading, setActionLoading] = React.useState<boolean>(false);
    const [actionMessage, setActionMessage] = React.useState<string | null>(null);
    const [actionError, setActionError] = React.useState<string | null>(null);

    const fetchAsset = React.useCallback(async () => {
        setLoading(true);
        setActionError(null);
        try {
            const response = await axios.get('/api/asset', {
                withCredentials: true,
            });
            if (response.data && typeof response.data === 'object' && 'success' in response.data && !response.data.success) {
                throw new Error(response.data.error || 'API Error');
            }
            const rows = extractRows<Asset>(response.data);
            setAssets(rows);
        } catch (error) {
            console.error('Failed to load assets', error);
            setActionError('Unable to fetch assets. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUsers = React.useCallback(async () => {
        setUsersLoading(true);
        try {
            const response = await axios.get('/api/users', {
                params: { limit: 200 },
                withCredentials: true,
            });
            if (response.data && typeof response.data === 'object' && 'success' in response.data && !response.data.success) {
                throw new Error(response.data.error || 'API Error');
            }
            const rows = extractRows<SnipeUserSummary>(response.data);
            const formatted: SnipeUserSummary[] = rows.map((user) => ({
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
            }));
            setUsers(formatted);
        } catch (error) {
            console.error('Failed to load users', error);
            setActionError('Unable to fetch users for checkout.');
        } finally {
            setUsersLoading(false);
        }
    }, []);

    const fetchLocations = React.useCallback(async () => {
        setLocationsLoading(true);
        try {
            const response = await axios.get('/api/locations', {
                params: { limit: 200 },
                withCredentials: true,
            });
            if (response.data && typeof response.data === 'object' && 'success' in response.data && !response.data.success) {
                throw new Error(response.data.error || 'API Error');
            }
            const rows = extractRows<SnipeLocationSummary>(response.data);
            const formatted: SnipeLocationSummary[] = rows.map((location) => ({
                id: location.id,
                name: location.name,
            }));
            setLocations(formatted);
        } catch (error) {
            console.error('Failed to load locations', error);
            setActionError('Unable to fetch locations for checkin.');
        } finally {
            setLocationsLoading(false);
        }
    }, []);

    const fetchStatusLabels = React.useCallback(async () => {
        setStatusLabelsLoading(true);
        try {
            const response = await axios.get('/api/status-labels', {
                params: { limit: 200 },
                withCredentials: true,
            });
            if (response.data && typeof response.data === 'object' && 'success' in response.data && !response.data.success) {
                throw new Error(response.data.error || 'API Error');
            }
            const rows = extractRows<SnipeStatusLabelSummary>(response.data);
            const formatted: SnipeStatusLabelSummary[] = rows.map((status) => ({
                id: status.id,
                name: status.name,
                status_meta: status.status_meta,
            }));
            setStatusLabels(formatted);
        } catch (error) {
            console.error('Failed to load status labels', error);
            setActionError('Unable to fetch status labels for checkout.');
        } finally {
            setStatusLabelsLoading(false);
        }
    }, []);

    const resetForms = () => {
        setCheckoutForm({ assigned_to: '', status_id: '', expected_checkin: '', note: '' });
        setCheckinForm({ note: '', location_id: '', status_id: '' });
    };

    const handleSelectAction = (asset: Asset, action: ActionType) => {
        setActionMessage(null);
        setActionError(null);
        setActionState({ assetId: asset.id, action });

        if (action === 'checkout') {
            const assignedId = typeof asset.assigned_to === 'object' && asset.assigned_to !== null && 'id' in asset.assigned_to
                ? String((asset.assigned_to as { id?: number })?.id ?? '')
                : '';
            const statusId = asset.status_label?.id ? String(asset.status_label?.id) : '';
            setCheckoutForm({ assigned_to: assignedId, status_id: statusId, expected_checkin: '', note: '' });
            if (!users.length && !usersLoading) {
                void fetchUsers();
            }
            if (!statusLabels.length && !statusLabelsLoading) {
                void fetchStatusLabels();
            }
        } else {
            const locationId = asset.location?.id ? String(asset.location?.id) : '';
            const statusId = asset.status_label?.id ? String(asset.status_label?.id) : '';
            setCheckinForm({ note: '', location_id: locationId, status_id: statusId });
            if (!locations.length && !locationsLoading) {
                void fetchLocations();
            }
            if (!statusLabels.length && !statusLabelsLoading) {
                void fetchStatusLabels();
            }
        }
    };

    const handleCancelAction = () => {
        setActionState({ assetId: null, action: null });
        resetForms();
    };

    const buildCheckoutPayload = (asset: Asset) => {
        const assignedUserId = Number(checkoutForm.assigned_to);
        const payload: CheckoutPayload = {
            assigned_to: assignedUserId,
            checkout_to_type: 'user',
        };

        payload.assigned_user = assignedUserId;

        if (asset.id) {
            payload.assigned_asset = asset.id;
        }

        if (checkoutForm.expected_checkin) {
            const formattedExpectedCheckin = formatDateTimeForSnipe(checkoutForm.expected_checkin);
            if (formattedExpectedCheckin) {
                payload.expected_checkin = formattedExpectedCheckin;
            }
        }

        if (checkoutForm.note) {
            payload.note = checkoutForm.note;
        }

        if (asset?.name) {
            payload.name = asset.name;
        }

        if (checkoutForm.status_id) {
            const statusId = Number(checkoutForm.status_id);
            if (!Number.isNaN(statusId)) {
                payload.status_id = statusId;
            }
        }

        const formattedCheckoutTime = formatDateTimeForSnipe(new Date());
        if (formattedCheckoutTime) {
            payload.checkout_at = formattedCheckoutTime;
        }

        return payload;
    };

    const validateCheckout = (asset: Asset | undefined): asset is Asset => {
        if (!checkoutForm.assigned_to) {
            setActionError('Please select a user to assign this asset to.');
            return false;
        }

        if (!asset) {
            setActionError('Unable to find asset details for this checkout.');
            return false;
        }

        if (!checkoutForm.status_id) {
            setActionError('Please choose a deployment status for this asset.');
            return false;
        }

        return true;
    };

    const submitCheckout = async (assetId: number) => {
        setActionLoading(true);
        setActionError(null);
        setActionMessage(null);

        const currentAsset = assets.find((item) => item.id === assetId);
        if (!validateCheckout(currentAsset)) {
            setActionLoading(false);
            return;
        }

        try {
            const payload = buildCheckoutPayload(currentAsset);

            await axios.post(`/api/hardware/${assetId}/checkout`, payload, {
                withCredentials: true,
            });

            setActionMessage('Asset checked out successfully.');
            setActionState({ assetId: null, action: null });
            resetForms();
            await fetchAsset();
        } catch (error) {
            console.error('Checkout failed', error);
            setActionError(extractApiErrorMessage(error));
        } finally {
            setActionLoading(false);
        }
    };

    const submitCheckin = async (assetId: number) => {
        if (!checkinForm.location_id) {
            setActionError('A location is required to check in this asset.');
            return;
        }

        if (!checkinForm.status_id) {
            setActionError('Please choose a status for this asset on check-in.');
            return;
        }

        setActionLoading(true);
        setActionError(null);
        setActionMessage(null);

        try {
            const payload: CheckinPayload = {
                location_id: Number(checkinForm.location_id),
            };

            if (checkinForm.status_id) {
                const statusId = Number(checkinForm.status_id);
                if (!Number.isNaN(statusId)) {
                    payload.status_id = statusId;
                }
            }

            if (checkinForm.note) {
                payload.note = checkinForm.note;
            }

            await axios.post(`/api/hardware/${assetId}/checkin`, payload, {
                withCredentials: true,
            });

            setActionMessage('Asset checked in successfully.');
            setActionState({ assetId: null, action: null });
            resetForms();
            await fetchAsset();
        } catch (error) {
            console.error('Checkin failed', error);
            setActionError(extractApiErrorMessage(error));
        } finally {
            setActionLoading(false);
        }
    };

    React.useEffect(() => {
        void fetchAsset();
    }, [fetchAsset]);

    React.useEffect(() => {
        void fetchStatusLabels();
    }, [fetchStatusLabels]);

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold text-white">Assets</h1>

            <AnimatePresence>
                {actionMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-md flex items-center"
                    >
                        <CheckCircleIcon className="h-6 w-6 mr-3"/>
                        {actionMessage}
                    </motion.div>
                )}

                {actionError && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md flex items-center"
                    >
                        <XCircleIcon className="h-6 w-6 mr-3"/>
                        {actionError}
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="text-center py-10">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full inline-block"
                    ></motion.div>
                    <p className="mt-4 text-gray-300">Loading Assets...</p>
                </div>
            ) : assets.length === 0 ? (
                <div className="text-center py-10 bg-gray-800 rounded-lg shadow">
                    <InformationCircleIcon className="h-12 w-12 text-gray-500 mx-auto"/>
                    <p className="mt-4 text-gray-300">No assets found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {assets.map((asset) => {
                        const isCurrentAction = actionState.assetId === asset.id ? actionState.action : null;
                        const isDeployed = asset.status_label?.status_meta === 'deployed';
                        
                        return (
                            <motion.div 
                                key={asset.id} 
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="overflow-hidden rounded-3xl bg-neutral-base shadow-lg ring-1 ring-neutral-dark-gray/10 transition-transform duration-300 hover:-translate-y-1"
                            >
                                <div
                                    className="p-5 text-white"
                                    style={{
                                        background: isDeployed
                                            ? 'linear-gradient(135deg, rgba(13,37,63,0.95), rgba(255,107,0,0.85))'
                                            : 'linear-gradient(135deg, rgba(17,24,39,0.9), rgba(31,41,55,0.85))',
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="truncate text-lg font-heading">{asset.name}</h3>
                                        <span className="rounded-full bg-neutral-base/15 px-3 py-1 font-mono text-xs">{asset.asset_tag}</span>
                                    </div>
                                    <p className="mt-2 text-sm opacity-80">{asset.model?.name}</p>
                                </div>
                                
                                <div className="space-y-3 p-5 text-sm text-neutral-dark-gray">
                                    <div className="flex items-center">
                                        <ComputerDesktopIcon className="mr-2 h-5 w-5 text-support"/>
                                        <span>Status: <span className="font-semibold text-primary">{asset.status_label?.name}</span></span>
                                    </div>
                                    {isDeployed && asset.assigned_to && typeof asset.assigned_to === 'object' && 'name' in asset.assigned_to && (
                                        <div className="flex items-center">
                                            <UserCircleIcon className="mr-2 h-5 w-5 text-support"/>
                                            <span>Assigned To: <span className="font-semibold text-primary">{(asset.assigned_to as { name: string })?.name}</span></span>
                                        </div>
                                    )}
                                    <div className="flex items-center">
                                        <BuildingOffice2Icon className="mr-2 h-5 w-5 text-support"/>
                                        <span>Location: <span className="font-semibold text-primary">{asset.location?.name}</span></span>
                                    </div>
                                    <div className="pt-2 text-xs text-neutral-dark-gray/60">
                                        <p>Serial: {asset.serial || 'N/A'}</p>
                                        <p>Last Update: {asset.updated_at?.formatted}</p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 border-t border-neutral-light-gray/60 bg-neutral-base px-5 py-4">
                                    <button
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                        onClick={() => router.push(`/dashboard/assets/${asset.id}`)}
                                    >
                                        <EyeIcon className="h-4 w-4" />
                                        View Details
                                    </button>
                                    {asset.available_actions?.checkout && !asset.assigned_to && (
                                        <button
                                            className="btn-primary text-sm"
                                            onClick={() => handleSelectAction(asset, 'checkout')}
                                            disabled={actionLoading && isCurrentAction === 'checkout'}
                                        >
                                            Checkout
                                        </button>
                                    )}
                                    {asset.available_actions?.checkin && (
                                        <button
                                            className="btn-outline text-sm"
                                            onClick={() => handleSelectAction(asset, 'checkin')}
                                            disabled={actionLoading && isCurrentAction === 'checkin'}
                                        >
                                            Checkin
                                        </button>
                                    )}
                                </div>

                                <AnimatePresence>
                                {isCurrentAction && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div
                                            className="p-5"
                                            style={{
                                                backgroundColor: isCurrentAction === 'checkout'
                                                    ? 'rgba(0, 198, 255, 0.08)'
                                                    : 'rgba(13, 37, 63, 0.05)',
                                            }}
                                        >
                                            <h4 className="mb-3 text-center font-heading text-primary">{isCurrentAction === 'checkout' ? 'Checkout Asset' : 'Checkin Asset'}</h4>
                                            
                                            {isCurrentAction === 'checkout' && (
                                                <div className="space-y-3">
                                                    <select value={checkoutForm.assigned_to} onChange={(e) => setCheckoutForm(p => ({...p, assigned_to: e.target.value}))} className="w-full rounded-xl border border-neutral-light-gray/80 bg-neutral-base p-3 text-sm focus:border-support focus:outline-none">
                                                        <option value="">Select User...</option>
                                                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                                    </select>
                                                    <select value={checkoutForm.status_id} onChange={(e) => setCheckoutForm(p => ({...p, status_id: e.target.value}))} className="w-full rounded-xl border border-neutral-light-gray/80 bg-neutral-base p-3 text-sm focus:border-support focus:outline-none">
                                                        <option value="">Select Status...</option>
                                                        {statusLabels.filter(s => s.status_meta === 'deployed').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                    </select>
                                                    <input type="date" value={checkoutForm.expected_checkin} onChange={(e) => setCheckoutForm(p => ({...p, expected_checkin: e.target.value}))} className="w-full rounded-xl border border-neutral-light-gray/80 p-3 text-sm focus:border-support focus:outline-none" placeholder="Expected Check-in"/>
                                                    <textarea value={checkoutForm.note} onChange={(e) => setCheckoutForm(p => ({...p, note: e.target.value}))} className="w-full rounded-xl border border-neutral-light-gray/80 p-3 text-sm focus:border-support focus:outline-none" placeholder="Note..."></textarea>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => submitCheckout(asset.id)} disabled={actionLoading} className="btn-primary w-full disabled:opacity-50">{actionLoading ? 'Processing...' : 'Confirm'}</button>
                                                        <button onClick={handleCancelAction} className="btn-outline w-full">Cancel</button>
                                                    </div>
                                                </div>
                                            )}

                                            {isCurrentAction === 'checkin' && (
                                                <div className="space-y-3">
                                                    <select value={checkinForm.location_id} onChange={(e) => setCheckinForm(p => ({...p, location_id: e.target.value}))} className="w-full rounded-xl border border-neutral-light-gray/80 bg-neutral-base p-3 text-sm focus:border-support focus:outline-none">
                                                        <option value="">Select Location...</option>
                                                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                                    </select>
                                                    <select value={checkinForm.status_id} onChange={(e) => setCheckinForm(p => ({...p, status_id: e.target.value}))} className="w-full rounded-xl border border-neutral-light-gray/80 bg-neutral-base p-3 text-sm focus:border-support focus:outline-none">
                                                        <option value="">Select Status...</option>
                                                        {statusLabels.filter(s => s.status_meta !== 'deployed').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                    </select>
                                                    <textarea value={checkinForm.note} onChange={(e) => setCheckinForm(p => ({...p, note: e.target.value}))} className="w-full rounded-xl border border-neutral-light-gray/80 p-3 text-sm focus:border-support focus:outline-none" placeholder="Note..."></textarea>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => submitCheckin(asset.id)} disabled={actionLoading} className="btn-secondary w-full disabled:opacity-50">{actionLoading ? 'Processing...' : 'Confirm'}</button>
                                                        <button onClick={handleCancelAction} className="btn-outline w-full">Cancel</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AssetsPage;
