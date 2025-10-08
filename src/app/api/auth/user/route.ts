import { ApiDict } from "@/data/snipe_it_api/ApiDict";
import { secretKeyFetch, verifyToken } from "@/lib/token/token";
import { NextRequest, NextResponse } from "next/server";

export const GET=async(req:NextRequest)=>{
    try {
        const token = req.cookies.get('accessToken')?.value;
        if(!token){
            return NextResponse.json({message:"No token found"}, {status: 401});
        }
        const decoded = await verifyToken(token);
        if(!decoded || typeof decoded !== 'object' || !('username' in decoded)){
            return NextResponse.json({message:"Invalid token"}, {status: 401});
        }
        const secretData = await secretKeyFetch(token);
        if(!secretData || typeof secretData !== 'object' || !secretData.secret){
            return NextResponse.json({message:"User data not found"}, {status: 403});
        }
        const userData = await ApiDict.findUserByUsername(secretData.secret, decoded.username);
        if (userData.success) {
            return NextResponse.json({message:"Token is valid", user: userData.data.rows[0]}, {status: 200});
        } else {
            return NextResponse.json({message:"Failed to fetch user data"}, {status: 500});
        }
    } catch (error) {

        console.log(error)
        return NextResponse.json({message:"Internal server error"}, {status: 500});
    }
    
}