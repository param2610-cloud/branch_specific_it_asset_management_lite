import { ApiDict } from "@/data/snipe_it_api/ApiDict";
import { secretKeyFetch, verifyToken } from "@/lib/token/token";
import { NextRequest } from "next/server";

export const GET = async(req: NextRequest) => {
    const token = req.cookies.get('accessToken')?.value;
        if (!token) {
            return new Response("No token found", { status: 401 });
        }
        const validation = verifyToken(token);
        if (!validation) {
            return new Response("Invalid token", { status: 403 });
        }
    
        const userData = await secretKeyFetch(token);
        if (!userData || typeof userData !== 'object' || !userData.secret || !userData.locationId) {
            return new Response("User data not found", { status: 403 });
        }
    
        const url = new URL(req.url);
        const params = Object.fromEntries(url.searchParams);

        const result = await ApiDict.getSpecificLocation(userData.secret, userData.locationId);
        if (result.success) {
            return new Response(JSON.stringify(result.data), { status: 200 });
        } else {
            return new Response(`API Error: ${result.error}`, { status: 500 });
        }
}