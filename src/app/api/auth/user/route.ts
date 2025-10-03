import { verifyToken } from "@/lib/token/token";
import { NextRequest, NextResponse } from "next/server";

export const GET=async(req:NextRequest,res:NextResponse)=>{
    try {
        const token = req.cookies.get('accessToken')?.value;
        if(!token){
            return NextResponse.json({message:"No token found"}, {status: 401});
        }
        const decoded = await verifyToken(token);
        if(!decoded){
            return NextResponse.json({message:"Invalid token"}, {status: 401});
        }
        return NextResponse.json({message:"Token is valid", user:decoded}, {status: 200});
    } catch (error) {

        console.log(error)
        return NextResponse.json({message:"Internal server error"}, {status: 500});
    }
    
}