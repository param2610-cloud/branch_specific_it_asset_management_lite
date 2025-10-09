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
            const response = await axiosInstance.get("/hardware", { params: { ...params, location_id: locationId } });
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
            const response = await axiosInstance.post(`/hardware/${id}/checkout`, checkoutData);
            return { success: true, data: response.data };
        } catch (error) {
            return getErrorMessage(error);
        }
    },
    async checkinAsset(secret: string, locationId: number, id: number, checkinData: Record<string, unknown>): Promise<ApiResult<any>> {
        const axiosInstance = createSnipeItAxios(secret);
        try {
            const response = await axiosInstance.post(`/hardware/${id}/checkin`, checkinData);
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