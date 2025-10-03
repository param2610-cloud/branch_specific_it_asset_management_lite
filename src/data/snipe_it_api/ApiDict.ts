import { createSnipeItAxios } from "./Axios"

export const ApiDict= {
    async allAssetFetch(secret:string, locationId: number, params?:any){
        const axiosInstance = createSnipeItAxios(secret);
        try {
            const response = await axiosInstance.get('/hardware', { params: { ...params, location_id: locationId } });
            return {success:true,data:response.data};
        } catch (error:any) {
            return {success:false,error:error.response?.data?.message || error. message};
        }
    },
    async singleAssetFetch(secret:string, locationId: number, id:number){
        const axiosInstance = createSnipeItAxios(secret);
        try {
            const response = await axiosInstance.get(`/hardware/${id}`);
            return {success:true,data:response.data};
        } catch (error:any) {
            return {success:false,error:error.response?.data?.message || error. message};
        }
    },
    async checkoutAsset(secret:string, locationId: number, id:number,checkoutData:any){
        const axiosInstance = createSnipeItAxios(secret);
        try {
            const response = await axiosInstance.post(`/hardware/${id}/checkout`, checkoutData);
            return {success:true,data:response.data};
        } catch (error:any) {
            return {success:false,error:error.response?.data?.message || error. message};
        }
    },
    async checkinAsset(secret:string, locationId: number, id:number,checkinData:any){
        const axiosInstance = createSnipeItAxios(secret);
        try {
            const response = await axiosInstance.post(`/hardware/${id}/checkin`, checkinData);
            return {success:true,data:response.data};
        } catch (error:any) {
            return {success:false,error:error.response?.data?.message || error. message};
        }
    },
    async listOfUsers(secret:string, locationId: number, params?:any){
        const axiosInstance = createSnipeItAxios(secret);
        try {
            const response = await axiosInstance.get('/users', { params });
            return {success:true,data:response.data};
        } catch (error:any) {
            return {success:false,error:error.response?.data?.message || error. message};
        }
    },
    async getLocations(secret:string, params?:any){
        const axiosInstance = createSnipeItAxios(secret);
        try {
            const response = await axiosInstance.get('/locations', { params });
            return {success:true,data:response.data};
        } catch (error:any) {
            return {success:false,error:error.response?.data?.message || error. message};
        }
    },
    async createUser(secret:string, locationId: number, userData:any){
        const axiosInstance = createSnipeItAxios(secret);
        try {
            const response = await axiosInstance.post('/users', { ...userData, location_id: locationId });
            return {success:true,data:response.data};
        } catch (error:any) {
            return {success:false,error:error.response?.data?.message || error. message};
        }
    },
    async getSpecificUser(secret:string,id:number){
        const axiosInstance = createSnipeItAxios(secret);
        try {
            const response = await axiosInstance.get(`/users/${id}`);
            return {success:true,data:response.data};
        } catch (error:any) {
            return {success:false,error:error.response?.data?.message || error. message};
        }
    },
    async getUserAssets(secret:string,id:number,params?:any){
        const axiosInstance = createSnipeItAxios(secret);
        try {
            const response = await axiosInstance.get(`/users/${id}/hardware`,{params});
            return {success:true,data:response.data};
        } catch (error:any) {
            return {success:false,error:error.response?.data?.message || error. message};
        }
    },
    async getCompanies(secret:string, params?:any){
        const axiosInstance = createSnipeItAxios(secret);

        try {
            const response = await axiosInstance.get('/companies', { params });

            return {success:true,data:response.data};
        } catch (error:any) {
            return {success:false,error:error.response?.data?.message || error. message};
        }
    }

}