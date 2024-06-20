import express, { Request, Response, Router } from 'express';
import SubscriptionService from '../services/subscriptionService';
import { injectable } from "tsyringe";

@injectable()
export default class SubscriptionResource {

    private readonly router: Router;

    constructor(private subscriptionService: SubscriptionService) {
        this.router = express.Router();
        this.subscriptionService = subscriptionService;
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // authenticated route, user id comes from auth
        // Gets only current subscription (endDate > today), can be refactored to make current optional in the future
        this.router.get("/", async (req: Request, res: Response) => {
            const { exclude_cant_renew } = req.query
            const { id } = req.user
            const excludeCantRenew = exclude_cant_renew === 'true'
            const response = await this.subscriptionService.getMostRecentSubscriptionsByBuyerId(id as string, excludeCantRenew);
            if (response === null) {
                res.sendStatus(420)
            } else {res.status(200).send(response)}
        });

        // this will not be a route, payment will handle the charge of the sub, and after it`ll proceed to post it
        // authenticated route, user data to post subscription
        this.router.post("/", async (req: Request, res: Response) => {
            const { id, stripe_customer_id, stripe_payment_method_id, current_balance } = req.user
            const { subscription_level_id } = req.body
            const response =
                await this.subscriptionService.postSubscription(
                    { subscription_level_id, user_id: id as string },
                    stripe_customer_id as string,
                    stripe_payment_method_id as string,
                    current_balance as number
                );
            response === null ? res.sendStatus(400) : res.status(200).send(response)
        });

        this.router.get("/levels", async (_req: Request, res: Response) => {
            const response = await this.subscriptionService.getSubscriptionsLevels();
            res.status(200).send(response)
        });

        // pause subscription
        // authenticated on DAO can only pause subscriptions that belong to the authenticated user
        this.router.put("/pause", async (req: Request, res: Response) => {
            const { id } = req.user
            const { subscription_id } = req.body
            const response =
                await this.subscriptionService.updateSubscription({ id: subscription_id, can_renew: false, user_id: id });
            res.status(200).send(response)
        })

        // resume subscription
        // authenticated on DAO can only resume subscriptions that belong to the authenticated user
        this.router.put("/resume", async (req: Request, res: Response) => {
            const { id } = req.user
            const { subscription_id } = req.body
            const response =
                await this.subscriptionService.updateSubscription({ id: subscription_id, can_renew: true, user_id: id });
            res.status(200).send(response)
        })

        // upgrade subscription
        // authenticated, buyer can only upgrade his subscription because data comes from req.user
        this.router.post("/upgrade", async (req: Request, res: Response) => {
            const { id, stripe_customer_id, stripe_payment_method_id, current_balance } = req.user
            const { subscription_level_id } = req.body
            const response =
                await this.subscriptionService.upgradeSubscription(
                    subscription_level_id, // the one we want to upgrade to
                    id as string,
                    stripe_customer_id as string,
                    stripe_payment_method_id as string,
                    current_balance
                );
            res.status(200).send(response)
        })

        // Calculates the price of the subscription upgrade and the subscription period
        // authenticated, buyer can only calculate the upgrade for his subscription because id comes from req.user
        this.router.get("/upgrade", async (req: Request, res: Response) => {
            const { id } = req.user
            const response =
                await this.subscriptionService.getUpgradePrice(
                    id as string,
                );
            res.status(200).send(response)
        })
    }

    public routes(): Router {
        return this.router;
    }
}