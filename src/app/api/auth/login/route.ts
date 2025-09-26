import { NextRequest, NextResponse } from "next/server";
import {z} from 'zod';

const schema = z.object({
    username:z.string().min(3),
    password:z.string().min(6),
});

export const POST= async (req:NextRequest,res:NextResponse)=>{
    try {
        const result= schema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({message:"Invalid input",errors:result.error.errors});
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal server error"});
    }
}