import { ApiDict } from "@/data/snipe_it_api/ApiDict";
import { secretKeyFetch, verifyToken } from "@/lib/token/token";
import { NextRequest } from "next/server"

export async function GET(req:NextRequest){
    try {
        const token = req.cookies.get('accessToken')?.value;
        if (!token) {
            return new Response(JSON.stringify({message:"No token found"}), {status: 401});
        }
        const validateToken= verifyToken(token);
        if (!validateToken) {
            return new Response(JSON.stringify({message:"Invalid token"}), {status: 403});
        }
        const userData = await secretKeyFetch(token);
        if(!userData || typeof userData!=='object' || !userData.secret || !userData.locationId){
            return new Response(JSON.stringify({message:"User data not found"}), {status: 403});
        }
        const url = new URL(req.url);
        const params = Object.fromEntries(url.searchParams);
        const result = await ApiDict.getCompanies(userData.secret, params);
        if (result.success) {
            const data = result.data as { rows?: unknown[] };
            return new Response(JSON.stringify(data.rows || []), {status: 200});
        } else {
            return new Response(JSON.stringify({message:`API Error: ${result.error}`}), {status: 500});
        }
    } catch (error) {
        console.log(error)
        return new Response(JSON.stringify({message:"Internal server error"}), {status: 500});
    }
}