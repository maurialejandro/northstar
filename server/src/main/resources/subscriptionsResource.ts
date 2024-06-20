import express, { Request, Response, Router } from 'express';
import { injectable } from "tsyringe";
import SubscriptionsService from '../services/subscriptionService';

@injectable()
export default class BuyerResource {

    private readonly router: Router;

    constructor(private readonly subscriptionsService: SubscriptionsService) {

        this.router = express.Router();
        this.subscriptionsService = subscriptionsService;
        this.initializeRoutes();
    }

    private initializeRoutes() {

        this.router.get('/admin/:id', async (req: Request, res: Response) => {
                const { id } = req.params;
                const buyer = await this.subscriptionsService.getSubscriptionsByBuyerId(id, true);
                res.status(200).json(buyer)
        });

    }

    public routes(): Router {
        return this.router;
    }
}
