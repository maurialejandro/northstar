// Middleware to validate and authenticate the token
import { Request, Response, NextFunction } from 'express';
import { SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js";
import { injectable } from "tsyringe";
import { User as DBUser } from "../types/userTypes";

declare module "express-serve-static-core" {
    interface Request {
        user: DBUser
    }
}

@injectable()
export class Authenticator {

    constructor(private readonly supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    async authenticateToken(req: Request & { user?: DBUser | null }, res: Response & { user?: DBUser }, next: NextFunction) {
        const token = req.headers['authorization']?.split(' ')[1];
        let user: SupabaseUser | null;

        if (token != null) {
            const { data, error } = await this.supabase.auth.getUser(token || '');
            user = data.user;
            if (error) {
                if (error.status) {
                    console.warn("Failed to authenticate!")
                    return res.sendStatus(error.status);
                } else {
                    console.error("Error in authenticator");
                    console.error(error);
                    return res.sendStatus(500);
                }
            }
        } else {
            console.warn("User with no token attempted to hit API");
            return res.sendStatus(401);
        }

        const { data, error } =
            await this.supabase.from('users')
                .select('*')
                .eq('auth', user!.id).maybeSingle();

        if (error) {
            console.error(`Error in authenticator (2) when trying to find user with ${user!.id}`);
            console.error(error);
            return res.sendStatus(500);
        } else if (data == null) {
            console.error(`No matching user with ${user!.id}`);
            return res.sendStatus(403)
        } else {
            if (req.path.includes("admin") && data!.role !== 'admin') {
                console.warn("Non-admin attempted to hit admin API");
                return res.sendStatus(403)
            }
            req.user = data as DBUser;
            next();
        }
    }

    authenticateFunc() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        return async function (req: Request, res: Response, next: NextFunction) {
            return await self.authenticateToken(req, res, next);
        }
    }
}
