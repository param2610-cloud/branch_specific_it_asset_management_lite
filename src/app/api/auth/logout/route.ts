import { NextResponse } from "next/server";

export const POST = async () => {
    try {
        const response = NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
        response.cookies.set('accessToken', '', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            domain: '',
            path: '/',
            maxAge: 0 // Expire immediately
        });
        return response;
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
};