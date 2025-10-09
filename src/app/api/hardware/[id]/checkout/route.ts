import { verifyToken } from "@/lib/token/token";
import { secretKeyFetch } from "@/lib/token/token";
import { ApiDict } from "@/data/snipe_it_api/ApiDict";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const assetId = parseInt(id);
    if (isNaN(assetId)) {
        return new Response("Invalid ID", { status: 400 });
    }

    const checkoutData = await req.json();

    const result = await ApiDict.checkoutAsset(userData.secret, userData.locationId, assetId, checkoutData);
    console.log(result)
    if (result.success) {
        return new Response(JSON.stringify(result.data), { status: 200 });
    } else {
        return new Response(`API Error: ${result.error}`, { status: 500 });
    }
}