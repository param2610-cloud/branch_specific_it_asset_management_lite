import { ApiDict } from "@/data/snipe_it_api/ApiDict";
import { secretKeyFetch, verifyToken } from "@/lib/token/token";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const extractRows = (payload: unknown): Record<string, unknown>[] => {
    if (Array.isArray(payload)) {
        return payload as Record<string, unknown>[];
    }

    if (payload && typeof payload === "object" && Array.isArray((payload as { rows?: unknown[] }).rows)) {
        return ((payload as { rows?: unknown[] }).rows ?? []) as Record<string, unknown>[];
    }

    return [];
};

export const GET = async (req: NextRequest) => {
    try {
        const token = req.cookies.get("accessToken")?.value;
        if (!token) {
            return NextResponse.json({ message: "No token found" }, { status: 401 });
        }

        const decoded = verifyToken(token);
        const username = decoded && typeof decoded === "object" && "username" in decoded ? String((decoded as { username: unknown }).username) : null;
        if (!username) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        const sessionData = await secretKeyFetch(token);
        if (!sessionData || typeof sessionData !== "object" || !("secret" in sessionData)) {
            return NextResponse.json({ message: "User data not found" }, { status: 403 });
        }

        const secret = String((sessionData as { secret: unknown }).secret);
        const locationId = (sessionData as { locationId?: unknown }).locationId;

        const userData = await ApiDict.findUserByUsername(secret, username);
        if (!userData.success) {
            return NextResponse.json({ message: "Failed to fetch user data", details: userData.error }, { status: 502 });
        }

        const rows = extractRows(userData.data);
        if (!rows.length) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const [user] = rows;
        const enrichedUser = {
            ...user,
            locationId: typeof locationId === "number" ? locationId : undefined,
        };

        return NextResponse.json({ message: "Token is valid", user: enrichedUser }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
};