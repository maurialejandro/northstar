import express, { Request, Response, Router } from 'express';
import BuyerService from '../services/buyerService';
import { injectable } from "tsyringe";
import UserService from "../services/userService.ts";
import { BudgetCardProps } from "../types/buyerBudgetCardTypes.ts";

@injectable()
export default class BuyerResource {

    private readonly router: Router;

    constructor(
        private readonly buyerService: BuyerService,
        private readonly userService: UserService,
        ) {
            this.router = express.Router();
            this.initializeRoutes();
        }

    private initializeRoutes() {

        this.router.get('/admin', async (_req: Request, res: Response) => {
            const buyers = await this.buyerService.getBuyers();
                res.status(200).json(buyers)
        });

        this.router.get('/admin/:buyerId', async (req: Request, res: Response) => {
            const buyerId = req.params.buyerId!;
            const buyer = await this.buyerService.getBuyerById(buyerId);
            if (buyer == null) {
                res.status(422).json({});
            } else {
                res.status(200).json(buyer);
            }
        });

        this.router.get('/budget/get-remaining', async (req: Request, res: Response) => {
            const user_id = req.user.id
            const response: BudgetCardProps = await this.buyerService.getBudget(user_id)
            res.status(200).json(response)
        });

        // update budget
        this.router.put('/budget/update', async (req: Request, res: Response) => {
            const { monthly_budget } = req.body;
            const response = await this.userService.updateUser(req.user.id, { monthly_budget })
            res.status(200).json(response)
        });

        this.router.get('/admin/budget/get-remaining', async (req: Request, res: Response) => {
            const { user_id } = req.query;
            const response = await this.buyerService.getBudget(user_id as string);
            res.status(200).json(response)
        });

        // update budget as admin
        this.router.put('/admin/budget/update', async (req: Request, res: Response) => {
            const { user_id, monthly_budget } = req.body;
            const response = await this.userService.updateUser(user_id, { monthly_budget })
            res.status(200).json(response)
        });

    }

    public routes(): Router {
        return this.router;
    }
}