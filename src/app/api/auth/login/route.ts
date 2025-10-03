import { loginUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import {z} from 'zod';

const schema = z.object({
    username:z.string().min(3),
    password:z.string().min(6),
});

export const POST= async (req:NextRequest)=>{
    try {
        const body = await req.json();
        const result= schema.safeParse(body);
        if(!result.success){
            return NextResponse.json({message:"Invalid input",errors:result.error.issues}, {status: 400});
        }

        const response = await loginUser(result.data.username,result.data.password);
        if(response.status==200){
            return NextResponse.json(response, {status: 200});
        }
        if(response.status==401){
            return NextResponse.json({message:"User is unauthorized."}, {status: 401});
        }
        if(response.status==402){
            return NextResponse.json({message:"User does not exist"}, {status: 402});
        }
        if(response.status==500){
            return NextResponse.json({message:"Unexpected Error happened."}, {status: 500});
        }
    } catch (error) {
        console.log(error)
        return NextResponse.json({message:"Internal server error"}, {status: 500});
    }
}