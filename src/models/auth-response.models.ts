import { User } from "./user.models";

export class AuthResponse {
    token: string;
    user: User;
    otp: number;
    type: string;
    message: string;
    role: string;
}