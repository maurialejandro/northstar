import express, { Request, Response, Router } from 'express';
import TransactionsService from '../services/transactionsService';
import { injectable } from "tsyringe";

@injectable()
export default class TransactionsResource {

    private readonly router: Router;

    constructor(private readonly transactionsService: TransactionsService) {
        this.router = express.Router();
        this.transactionsService = transactionsService;
        this.initializeRoutes();
    }

    private initializeRoutes() {
        //Gets transactions from DB
        this.router.get("/admin/all", async (_req: Request, res: Response) => {
            const response = await this.transactionsService.getAll();
            res.status(200).send(response);
        });

        this.router.get("/user", async (req: Request, res: Response) => {
            const { id } = req.user
            const { limit, page, dateRange } = req.query
            if (!id) return res.sendStatus(403);
            const response = await this.transactionsService.getAllByBuyerId(id as string, limit as string, page as string, dateRange as string);
            
            res.status(200).send(response);
        });

        this.router.get("/admin/buyer_transactions/:id", async (req: Request, res: Response) => {
            const { id } = req.params
            const { limit, page , dateRange } = req.query
            const response = await this.transactionsService.getAllByBuyerId(id as string, limit as string, page as string, dateRange as string);
            res.status(200).send(response);
        });
    }

    public routes(): Router {
        return this.router;
    }
}