import express, { Request, Response, Router } from 'express';
import UserService from '../services/userService';
import { injectable } from "tsyringe";

@injectable()
export default class AuthenticateResource {

    private readonly router: Router;

    constructor(private readonly userService: UserService) {

        this.router = express.Router();
        this.userService = userService;
        this.initializeRoutes();
    }

    private initializeRoutes() {

        this.router.post('/register', async (req: Request, res: Response) => {
            const { email, password } = req.body;
            res.status(200).json( await this.userService.register(email, password))
        });

        this.router.post('/', async (req: Request, res: Response) => {
            const { email, password } = req.body;
            res.status(200).json( await this.userService.authenticate(email, password))
        });

    }

    public routes(): Router {
        return this.router;
    }
}
