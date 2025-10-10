import { verifyToken, secretKeyFetch } from "@/lib/token/token";
import { ApiDict } from "@/data/snipe_it_api/ApiDict";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) {
        return new Response("No token found", { status: 401 });
    }

    const validation = verifyToken(token);
    if (!validation) {
        return new Response("Invalid token", { status: 403 });
    }

    const userData = await secretKeyFetch(token);
    if (!userData || typeof userData !== "object" || !userData.secret) {
        return new Response("User data not found", { status: 403 });
    }

    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const result = await ApiDict.getStatusLabels(userData.secret, params);

    if (result.success) {
        return new Response(JSON.stringify(result.data), { status: 200 });
    }

    return new Response(`API Error: ${result.error}`, { status: 500 });
}
