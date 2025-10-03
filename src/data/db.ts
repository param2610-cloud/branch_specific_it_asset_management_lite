import { User } from '@/interface/user';
import fs from 'fs'
import path from 'path';


export const loadUsers = (): User[] => {
    const fileLocation= path.join(process.cwd(),'src','data','users.json');
    const fileContent= fs.readFileSync(fileLocation,'utf-8');
    return JSON.parse(fileContent);
}