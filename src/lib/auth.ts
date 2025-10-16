import { loadUsers } from "@/data/db";
import bcrypt from "bcryptjs";
import { generateAccessToken } from "./token/token";

type SanitizedUser = {
    username: string;
    name?: string;
    email?: string;
    locationId?: number;
};

type LoginResult = {
    message: string;
    status: number;
    user?: SanitizedUser;
    accessToken?: string;
};

export async function loginUser(username: string, password: string): Promise<LoginResult> {
    try {
        const users = loadUsers();
        const userRecord = users.find((user) => user.username === username);

        if (!userRecord) {
            return {
                message: "User not found.",
                status: 404,
            };
        }

        if (!userRecord.password) {
            return {
                message: "Credentials are misconfigured for this account.",
                status: 500,
            };
        }

        const passwordMatches = await bcrypt.compare(password, userRecord.password);

        if (!passwordMatches) {
            return {
                message: "Invalid username or password.",
                status: 401,
            };
        }

        const accessToken = generateAccessToken(userRecord.username);
        const sanitizedUser: SanitizedUser = {
            username: userRecord.username,
            name: userRecord.name,
            email: userRecord.email,
            locationId: userRecord.locationId,
        };

        return {
            message: "User authenticated successfully.",
            user: sanitizedUser,
            accessToken,
            status: 200,
        };
    } catch (error) {
        console.log(error);
        return {
            message: "Unexpected error occurred while authenticating.",
            status: 500,
        };
    }
    // find that user in main db with that username
    // if exists then validate password from user.json
    // if matched then return cookies with 1 day limit
    // navigate to protected area
}

