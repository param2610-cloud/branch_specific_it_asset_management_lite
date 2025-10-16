// Axios.ts
import axios, { AxiosInstance } from 'axios';

export function createSnipeItAxios(secret: string): AxiosInstance {
  return axios.create({
    baseURL: `${process.env.snipe_it_url}/api/v1`,
    headers: {
      'Authorization': `Bearer ${secret}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 20000, // 20 seconds
  });
}