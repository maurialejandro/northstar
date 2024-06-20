// jwtUtils.ts
import { injectable } from 'tsyringe';
import jwt from 'jsonwebtoken';
import { EnvConfig } from "../config/envConfig.ts";
import { User } from "../types/userTypes.ts";

interface DecodedToken extends Partial<User> {
    iat?: number;
    exp?: number;
}

@injectable()
export class JwtUtils {

    constructor(private readonly config: EnvConfig) {}

    generateToken(payload: object): string {
        return jwt.sign(payload, this.config.jwtSecret, { expiresIn: '1h' });
    }

    verifyToken(userId: string, token: string): string | object {
        const newUserData = jwt.verify(token, this.config.jwtSecret) as DecodedToken;
        if (newUserData.id !== userId) {
            return 'Invalid token';
        } else if (newUserData.exp && newUserData.exp < Date.now() / 1000) {
            return 'Token expired';
        } else {
            delete newUserData.iat;
            delete newUserData.exp;
            return newUserData;
        }
    }
}