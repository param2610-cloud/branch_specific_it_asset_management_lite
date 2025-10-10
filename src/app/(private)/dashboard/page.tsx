'use client';

import axios, { isAxiosError } from 'axios';
import React from 'react';

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

const DashboardPage = () => {
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
    console.log(assets)

    return (
        <div className="space-y-6 p-4">
            <div className="text-xl font-semibold">Aum Capital IT Asset Management System Lite</div>

            {actionMessage && (
                <div className="rounded border border-green-300 bg-green-50 p-3 text-green-800">
                    {actionMessage}
                </div>
            )}

            {actionError && (
                <div className="rounded border border-red-300 bg-red-50 p-3 text-red-800">
                    {actionError}
                </div>
            )}

            {loading && <div>Loading assets...</div>}

            {!loading && assets.length === 0 && (
                <div>No assets found</div>
            )}

            {!loading && assets.length > 0 && (
                <div className="space-y-4">
                    {assets.map((asset) => {
                        const isCurrentAction = actionState.assetId === asset.id ? actionState.action : null;
                        return (
                            <div key={asset.id} className="rounded border p-4 shadow-sm">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <div className="text-lg font-medium">{asset.name}</div>
                                        <div className="text-sm text-gray-600">{asset.asset_tag}</div>
                                        <div className="text-sm text-gray-600">Serial: {asset.serial || 'N/A'}</div>
                                        <div className="text-sm text-gray-600">Model: {asset.model?.name}</div>
                                        <div className="text-sm text-gray-600">Status: {asset.status_label?.name}</div>
                                        {
                                            asset.status_label?.status_meta === 'deployed' && asset.assigned_to && typeof asset.assigned_to === 'object' && 'name' in asset.assigned_to
                                                ? <div className="text-sm text-gray-600">Assigned To: {(asset.assigned_to as { name: string })?.name}</div>
                                                : null
                                        }
                                        <div className="text-sm text-gray-600">Category: {asset.category?.name}</div>
                                        <div className="text-sm text-gray-600">Manufacturer: {asset.manufacturer?.name}</div>
                                        <div className="text-sm text-gray-600">Company: {asset.company?.name}</div>
                                        <div className="text-sm text-gray-600">Location: {asset.location?.name}</div>
                                        <div className="text-xs text-gray-500">Created: {asset.created_at?.formatted}</div>
                                        <div className="text-xs text-gray-500">Updated: {asset.updated_at?.formatted}</div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {asset.available_actions?.checkout && !asset.assigned_to && (
                                            <button
                                                className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 disabled:bg-blue-300"
                                                onClick={() => handleSelectAction(asset, 'checkout')}
                                                disabled={actionLoading && isCurrentAction === 'checkout'}
                                            >
                                                Checkout
                                            </button>
                                        )}
                                        {asset.available_actions?.checkin && (
                                            <button
                                                className="rounded bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-700 disabled:bg-emerald-300"
                                                onClick={() => handleSelectAction(asset, 'checkin')}
                                                disabled={actionLoading && isCurrentAction === 'checkin'}
                                            >
                                                Checkin
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {isCurrentAction === 'checkout' && (
                                    <div className="mt-4 space-y-3 rounded border border-blue-200 bg-blue-50 p-3">
                                        <div className="font-semibold">Checkout Asset</div>
                                        <div className="space-y-2">
                                            <label className="flex flex-col text-sm">
                                                <span>User</span>
                                                <select
                                                    className="rounded border p-2"
                                                    value={checkoutForm.assigned_to}
                                                    onChange={(event) => setCheckoutForm((prev) => ({ ...prev, assigned_to: event.target.value }))}
                                                    disabled={usersLoading || actionLoading}
                                                >
                                                    <option value="">Select a user</option>
                                                    {users.map((user) => (
                                                        <option key={user.id} value={user.id}>
                                                            {user?.name} {user?.username ? `(${user?.username})` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                                {usersLoading && <span className="text-xs text-gray-500">Loading users...</span>}
                                            </label>
                                            <label className="flex flex-col text-sm">
                                                <span>Status on Checkout</span>
                                                <select
                                                    className="rounded border p-2"
                                                    value={checkoutForm.status_id}
                                                    onChange={(event) => setCheckoutForm((prev) => ({ ...prev, status_id: event.target.value }))}
                                                    disabled={statusLabelsLoading || actionLoading}
                                                >
                                                    <option value="">Select a status</option>
                                                    {statusLabels.map((statusLabel) => (
                                                        <option key={statusLabel.id} value={statusLabel.id}>
                                                            {statusLabel?.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {statusLabelsLoading && <span className="text-xs text-gray-500">Loading statuses...</span>}
                                            </label>
                                            <label className="flex flex-col text-sm">
                                                <span>Expected Check-in Date</span>
                                                <input
                                                    type="date"
                                                    className="rounded border p-2"
                                                    value={checkoutForm.expected_checkin}
                                                    onChange={(event) => setCheckoutForm((prev) => ({ ...prev, expected_checkin: event.target.value }))}
                                                    disabled={actionLoading}
                                                />
                                            </label>
                                            <label className="flex flex-col text-sm">
                                                <span>Note</span>
                                                <textarea
                                                    className="rounded border p-2"
                                                    value={checkoutForm.note}
                                                    onChange={(event) => setCheckoutForm((prev) => ({ ...prev, note: event.target.value }))}
                                                    disabled={actionLoading}
                                                />
                                            </label>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 disabled:bg-blue-300"
                                                onClick={() => submitCheckout(asset.id)}
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? 'Processing...' : 'Confirm Checkout'}
                                            </button>
                                            <button
                                                className="rounded bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300"
                                                onClick={handleCancelAction}
                                                disabled={actionLoading}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {isCurrentAction === 'checkin' && (
                                    <div className="mt-4 space-y-3 rounded border border-emerald-200 bg-emerald-50 p-3">
                                        <div className="font-semibold">Checkin Asset</div>
                                        <div className="space-y-2">
                                            <label className="flex flex-col text-sm">
                                                <span>Location</span>
                                                <select
                                                    className="rounded border p-2"
                                                    value={checkinForm.location_id}
                                                    onChange={(event) => setCheckinForm((prev) => ({ ...prev, location_id: event.target.value }))}
                                                    disabled={locationsLoading || actionLoading}
                                                >
                                                    <option value="">Select a location</option>
                                                    {locations.map((location) => (
                                                        <option key={location.id} value={location.id}>
                                                            {location?.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {locationsLoading && <span className="text-xs text-gray-500">Loading locations...</span>}
                                            </label>
                                            <label className="flex flex-col text-sm">
                                                <span>Status</span>
                                                <select
                                                    className="rounded border p-2"
                                                    value={checkinForm.status_id}
                                                    onChange={(event) => setCheckinForm((prev) => ({ ...prev, status_id: event.target.value }))}
                                                    disabled={statusLabelsLoading || actionLoading}
                                                >
                                                    <option value="">Select a status</option>
                                                    {statusLabels.map((statusLabel) => (
                                                        <option key={statusLabel.id} value={statusLabel.id}>
                                                            {statusLabel?.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {statusLabelsLoading && <span className="text-xs text-gray-500">Loading statuses...</span>}
                                            </label>
                                            <label className="flex flex-col text-sm">
                                                <span>Note</span>
                                                <textarea
                                                    className="rounded border p-2"
                                                    value={checkinForm.note}
                                                    onChange={(event) => setCheckinForm((prev) => ({ ...prev, note: event.target.value }))}
                                                    disabled={actionLoading}
                                                />
                                            </label>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                className="rounded bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-700 disabled:bg-emerald-300"
                                                onClick={() => submitCheckin(asset.id)}
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? 'Processing...' : 'Confirm Checkin'}
                                            </button>
                                            <button
                                                className="rounded bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300"
                                                onClick={handleCancelAction}
                                                disabled={actionLoading}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="text-sm text-gray-600">Total Assets: {assets.length}</div>
        </div>
    );
};

export default DashboardPage;