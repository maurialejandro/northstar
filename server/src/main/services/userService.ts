import UserDAO from '../data/userDAO';
import { injectable } from "tsyringe";
import { AuthResponse, AuthTokenResponse } from "@supabase/supabase-js";
import { User } from "../types/userTypes.ts";
import { JwtUtils } from "../middleware/tokenGenerator";
import SendGridIAO from "../data/sendGridIAO.ts";
import { emailGenerator } from "../middleware/emailGenerator.ts";

@injectable()
export default class UserService {

    constructor(private readonly user: UserDAO, private readonly mailService: SendGridIAO, private readonly jwtUtils: JwtUtils) {}

    async getRole(supabaseToken: string): Promise<{ role: string }> {
        return await this.user.getRole(supabaseToken);
    }

    async register(email: string, password: string): Promise<AuthResponse> {
        return await this.user.register(email, password);
    }

    async authenticate(email: string, password: string): Promise<AuthTokenResponse> {
        return await this.user.authenticate(email, password);
    }

    async getUserById(userId: string): Promise<User> {
        return this.user.getUserById(userId);
    }

    async requestUpdateContactInfo(currentUser: User, user: Partial<User>): Promise<boolean> {
        const newUserData = user;
        newUserData.id = currentUser.id;
        const token = this.jwtUtils.generateToken(newUserData);
        const msg = emailGenerator.changeContactInfo(currentUser, token);
        const emailSent = await this.mailService.sendEmail(msg);

        if (emailSent[0].statusCode !== 202) {
            return false;
        }

        return true;
    }

    async updateContactInfo(userId: string, token: string): Promise<User | string> {
        const newUserData = this.jwtUtils.verifyToken(userId, token);

        if (typeof newUserData === 'string') {
            return newUserData;
        }

        return await this.user.updateUserById(userId, newUserData);
    }

    async updateUser(user_id: string, user: Partial<User>): Promise<User | string> {
        return await this.user.updateUserById(user_id, user);
    }
}
