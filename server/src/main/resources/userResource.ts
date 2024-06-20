import express, { Request, Response, Router } from 'express';
import { injectable } from "tsyringe";
import UserService from "../services/userService.ts";
import {User} from "../types/userTypes.ts";

@injectable()
export default class UserResource {

    private readonly router: Router;

    constructor(private readonly userService: UserService) {
        this.router = express.Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {

        this.router.get('/role', async (req: Request, res: Response) => {
            res.status(200).json({ role: req.user.role })
        });

        this.router.get('/info', async (req: Request, res: Response) => {
            const response = await this.userService.getUserById(req.user.id)
            res.status(200).json(response)
        });

        this.router.put('/info', async (req: Request, res: Response) => {
            const updatedUser: Partial<User> = req.body;
            const response = await this.userService.updateUser(req.user.id, updatedUser);
            res.status(200).json(response);
        });

        this.router.post('/request-update-contact', async (req: Request, res: Response) => {
            const updatedUser: Partial<User> = req.body;
            const response = await this.userService.requestUpdateContactInfo(req.user, updatedUser)
            res.status(200).json(response)
        });

        // this should pass the token to the userService, it is coming from the client query string
        // TODO: redundant code, refactor
        this.router.post('/confirm-update-contact', async (req: Request, res: Response) => {
            const { token } = req.body;
            // Check if token is a string and not undefined
            if (typeof token === 'string') {
                const response = await this.userService.updateContactInfo(req.user.id, token);
                res.status(200).json(response);
            } else {
                // Handle the error appropriately
                // TODO: handle error --- this might be redundant code
                res.status(400).json({ error: 'Invalid token' });
            }
        });

        // update-user

    }

    public routes(): Router {
        return this.router;
    }
}