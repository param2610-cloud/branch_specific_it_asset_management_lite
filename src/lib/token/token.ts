import { loadUsers } from '@/data/db';
import jwt from 'jsonwebtoken'

export function generateAccessToken(username: string) {
    return jwt.sign(
        { username },
        process.env.JWT_SECRET!,
        {
            expiresIn: '24h'
        }
    )
}

export function verifyToken(token: string) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        return decoded;
    } catch (error) {
        console.log(error)
        return null;
    }
}

export async function secretKeyFetch(token: string) {
    try {
        if (!token) return null;
        const decoded = verifyToken(token);

        if (!decoded || typeof decoded !== 'object' || !('username' in decoded)) return false;
        const username = decoded.username;

        const user = loadUsers().find(user => user.username === username);
        
        if (!user) return false;
        return { secret: user.secret, locationId: user.locationId };
    } catch (error) {
        console.log(error)
        return null;
    }
}