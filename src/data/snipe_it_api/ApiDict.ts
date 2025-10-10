import { AxiosError } from "axios";
import { createSnipeItAxios } from "./Axios";

type ApiSuccess<T> = {
    success: true;
    data: T;
};

type ApiFailure = {
    success: false;
    error: string;
    details?: unknown;
};

type ApiResult<T> = ApiSuccess<T> | ApiFailure;

const extractRows = (payload: unknown): any[] => {
    if (Array.isArray(payload)) {
        return payload;
    }
    if (payload && typeof payload === "object" && Array.isArray((payload as { rows?: unknown[] }).rows)) {
        return ((payload as { rows?: unknown[] }).rows as any[]) ?? [];
    }
    return [];
};

const mergeRowsIntoPayload = (payload: unknown, rows: any[]): unknown => {
    if (payload && typeof payload === "object") {
        const merged = { ...(payload as Record<string, unknown>), rows } as Record<string, unknown>;

        if (typeof (payload as Record<string, unknown>)?.["total"] === "number") {
            merged["total"] = rows.length;
        }
        if (typeof (payload as Record<string, unknown>)?.["total_records"] === "number") {
            merged["total_records"] = rows.length;
        }
        if (typeof (payload as Record<string, unknown>)?.["count"] === "number") {
            merged["count"] = rows.length;
        }

        return merged;
    }

    return rows;
};

const dedupeById = (rows: any[]): any[] => {
    const seen = new Map<number | string, any>();
    for (const item of rows) {
        const id = item && typeof item === "object" ? (item as { id?: number | string }).id : undefined;
        if (id === undefined) {
            continue;
        }
        if (!seen.has(id)) {
            seen.set(id, item);
        }
    }
    return Array.from(seen.values());
};

const extractLocationName = (payload: unknown): string | undefined => {
    if (!payload || typeof payload !== "object") {
        return undefined;
    }

    if (typeof (payload as { name?: unknown }).name === "string") {
        return (payload as { name: string }).name;
    }

    if (Array.isArray((payload as { rows?: unknown[] }).rows)) {
        const rows = (payload as { rows?: unknown[] }).rows ?? [];
        const first = rows.find((item) => item && typeof item === "object" && typeof (item as { name?: unknown }).name === "string") as { name?: string } | undefined;
        return first?.name;
    }

    return undefined;
};

const getErrorMessage = (error: unknown): ApiFailure => {
    if (error instanceof AxiosError) {
        const data = error.response?.data as any;
        if (!data) {
            return { success: false, error: error.message };
        }

        if (typeof data === "string") {
            return { success: false, error: data };
        }

        const messageParts: string[] = [];

        if (typeof data.message === "string") {
            messageParts.push(data.message);
        }

        if (typeof data.error === "string") {
            messageParts.push(data.error);
        }

        const fieldContainers = ["messages", "errors"] as const;
        for (const key of fieldContainers) {
            if (data[key] && typeof data[key] === "object") {
                const details = Object.entries(data[key] as Record<string, unknown>)
                .flatMap(([field, value]) => {
                    if (Array.isArray(value)) {
                        return value.map((item) => `${field}: ${String(item)}`);
                    }
                    return `${field}: ${String(value)}`;
                });
                if (details.length) {
                    messageParts.push(details.join(" | "));
                }
            }
        }

        return {
            success: false,
            error: messageParts.filter(Boolean).join(" - ") || error.message,
            details: data,
        };
    }

    if (error instanceof Error) {
        return { success: false, error: error.message };
    }

    return { success: false, error: "Unknown error" };
};

export const ApiDict = {
    async allAssetFetch(secret: string, locationId: number, params?: Record<string, unknown>): Promise<ApiResult<any>> {
        const axiosInstance = createSnipeItAxios(secret);
        try {
            const baseParams: Record<string, unknown> = { ...params };

            let primaryData: unknown;
            let combinedRows: any[] = [];

            if (typeof locationId === "number" && !Number.isNaN(locationId)) {
                baseParams.location_id = locationId;

                const baseResponse = await axiosInstance.get("/hardware", { params: baseParams });
                primaryData = baseResponse.data;
                combinedRows = extractRows(baseResponse.data);

                let locationName: string | undefined;
                try {
                    const locationResponse = await axiosInstance.get(`/locations/${locationId}`);
                    locationName = extractLocationName(locationResponse.data);
                } catch (error) {
                    console.error("Failed to resolve location name", error);
                }

                if (locationName) {
                    const searchParams: Record<string, unknown> = {
                        ...params,
                        search: locationName,
                    };

                    if (!("sort" in searchParams)) {
                        searchParams.sort = "name";
                    }
                    if (!("order" in searchParams)) {
                        searchParams.order = "asc";
                    }

                    const searchResponse = await axiosInstance.get("/hardware", { params: searchParams });
                    const searchRows = extractRows(searchResponse.data);
                    combinedRows = combinedRows.concat(searchRows);
                }

                combinedRows = dedupeById(combinedRows);

                const mergedPayload = mergeRowsIntoPayload(primaryData, combinedRows);
                return { success: true, data: mergedPayload };
            }

            const response = await axiosInstance.get("/hardware", { params: baseParams });
            return { success: true, data: response.data };
        } catch (error) {
            return getErrorMessage(error);
        }
    },
    async singleAssetFetch(secret: string, locationId: number, id: number): Promise<ApiResult<any>> {
        const axiosInstance = createSnipeItAxios(secret);
        try {
            const response = await axiosInstance.get(`/hardware/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            return getErrorMessage(error);
        }
    },
    async checkoutAsset(secret: string, locationId: number, id: number, checkoutData: Record<string, unknown>): Promise<ApiResult<any>> {
        const axiosInstance = createSnipeItAxios(secret);
        try {
            const payload: Record<string, unknown> = { ...checkoutData };
            if (typeof locationId === "number" && !Number.isNaN(locationId)) {
                if (payload["location_id"] == null) {
                    payload["location_id"] = locationId;
                }
                if (payload["assigned_location"] == null) {
                    payload["assigned_location"] = locationId;
                }
            }

            console.log("Checkout Data:", payload);
            const response = await axiosInstance.post(`/hardware/${id}/checkout`, payload);
            return { success: true, data: response.data };
        } catch (error) {
            return getErrorMessage(error);
        }
    },
    async checkinAsset(secret: string, locationId: number, id: number, checkinData: Record<string, unknown>): Promise<ApiResult<any>> {
        const axiosInstance = createSnipeItAxios(secret);
        try {
            const payload: Record<string, unknown> = { ...checkinData };
            if (typeof locationId === "number" && !Number.isNaN(locationId)) {
                if (payload["location_id"] == null) {
                    payload["location_id"] = locationId;
                }
                if (payload["assigned_location"] == null) {
                    payload["assigned_location"] = locationId;
                }
            }

            console.log("Checkin Data:", payload);
            const response = await axiosInstance.post(`/hardware/${id}/checkin`, payload);
            return { success: true, data: response.data };
        } catch (error) {
            return getErrorMessage(error);
        }
    },
    async listOfUsers(secret: string, locationId: number, params?: Record<string, unknown>): Promise<ApiResult<any>> {
        const axiosInstance = createSnipeItAxios(secret);
        try {
            const response = await axiosInstance.get("/users", { params });
            return { success: true, data: response.data };
        } catch (error) {
            return getErrorMessage(error);
        }
    },
    async getLocations(secret: string, params?: Record<string, unknown>): Promise<ApiResult<any>> {
        const axiosInstance = createSnipeItAxios(secret);
        try {
            const response = await axiosInstance.get("/locations", { params });
            return { success: true, data: response.data };
        } catch (error) {
            return getErrorMessage(error);
        }
    },
    async getStatusLabels(secret: string, params?: Record<string, unknown>): Promise<ApiResult<any>> {
        const axiosInstance = createSnipeItAxios(secret);
        try {
            const response = await axiosInstance.get("/statuslabels", { params });
            return { success: true, data: response.data };
        } catch (error) {
            return getErrorMessage(error);
        }
    },
    async createUser(secret: string, locationId: number, userData: Record<string, unknown>): Promise<ApiResult<any>> {
        const axiosInstance = createSnipeItAxios(secret);
        try {
            const response = await axiosInstance.post("/users", { ...userData, location_id: locationId });
            return { success: true, data: response.data };
        } catch (error) {
            return getErrorMessage(error);
        }
    },
    async getSpecificUser(secret: string, id: number): Promise<ApiResult<any>> {
        const axiosInstance = createSnipeItAxios(secret);
        try {
            const response = await axiosInstance.get(`/users/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            return getErrorMessage(error);
        }
    },
    async getUserAssets(secret: string, id: number, params?: Record<string, unknown>): Promise<ApiResult<any>> {
        const axiosInstance = createSnipeItAxios(secret);
        try {
            const response = await axiosInstance.get(`/users/${id}/hardware`, { params });
            return { success: true, data: response.data };
        } catch (error) {
            return getErrorMessage(error);
        }
    },
    async getCompanies(secret: string, params?: Record<string, unknown>): Promise<ApiResult<any>> {
        const axiosInstance = createSnipeItAxios(secret);
        try {
            const response = await axiosInstance.get("/companies", { params });
            return { success: true, data: response.data };
        } catch (error) {
            return getErrorMessage(error);
        }
    },
    async findUserByUsername(secret: string, username: string): Promise<ApiResult<any>> {
        const axiosInstance = createSnipeItAxios(secret);
        try {
            const response = await axiosInstance.get("/users", { params: { username } });
            return { success: true, data: response.data };
        } catch (error) {
            return getErrorMessage(error);
        }
    },
};