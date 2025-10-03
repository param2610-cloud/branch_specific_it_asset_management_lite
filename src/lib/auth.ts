import { loadUsers } from "@/data/db"
import bcrypt from 'bcryptjs';
import { generateAccessToken, verifyToken } from "./token/token";

export async function loginUser(username:string,password:string){
    try {
        const users = loadUsers()
        const findUser= users.find(user=>user.username==username)
        if(!findUser){
            return {
                message:"Username is not found;",
                status:402
            }
        }
        const accessToken = generateAccessToken(findUser.username);
        if(await bcrypt.compare(password,findUser.password)){
            return {
                message:"User is validated.",
                user:findUser,
                accessToken,
                status:200
            }
        }else{
            return {
                message:"User is unauthorized",
                status:401
            }
        }
    } catch (error) {
        console.log(error)
        return {
            message:"Unexpected Error happens.",
            status:500
        }
    }
    // find that user in main db with that username
    // if exists then validate password from user.json 
    // if matched then return cookies with 1 day limit 
    // navigate to protected area
}

