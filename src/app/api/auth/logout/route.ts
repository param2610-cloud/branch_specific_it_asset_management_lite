import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const isHttps = req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";
        const response = NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
        response.cookies.set("accessToken", "", {
            httpOnly: true,
            secure: isHttps,
            sameSite: "lax",
            path: "/",
            maxAge: 0,
            expires: new Date(0),
        });
        return response;
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
};