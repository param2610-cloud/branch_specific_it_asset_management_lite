import { loginUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
});

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const result = schema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ message: "Invalid input", errors: result.error.issues }, { status: 400 });
        }

        const authResult = await loginUser(result.data.username, result.data.password);

        if (authResult.status !== 200 || !authResult.accessToken) {
            const status = authResult.status === 200 ? 500 : authResult.status;
            return NextResponse.json({ message: authResult.message }, { status });
        }

        const responsePayload = {
            message: authResult.message,
            user: authResult.user,
        };

        const isHttps = req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";
        const response = NextResponse.json(responsePayload, { status: 200 });
        response.cookies.set("accessToken", authResult.accessToken, {
            httpOnly: true,
            secure: isHttps,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24, // 24 hours to match JWT expiry
        });

        return response;
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
};