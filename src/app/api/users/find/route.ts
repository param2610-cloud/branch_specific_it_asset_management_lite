import { verifyToken } from "@/lib/token/token";
import { secretKeyFetch } from "@/lib/token/token";
import { ApiDict } from "@/data/snipe_it_api/ApiDict";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
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
    const username = url.searchParams.get('username');
    if (!username) {
        return new Response("Username parameter required", { status: 400 });
    }

    const result = await ApiDict.findUserByUsername(userData.secret, username);
    if (result.success) {
        return new Response(JSON.stringify(result.data), { status: 200 });
    } else {
        return new Response(`API Error: ${result.error}`, { status: 500 });
    }
}