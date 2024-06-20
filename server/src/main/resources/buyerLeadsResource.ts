import express, { Request, Response, Router } from 'express';
import BuyerLeadsService from '../services/buyerLeadsService';
import { injectable } from "tsyringe";

@injectable()
export default class BuyerLeadsResource {

    private readonly router: Router;

    constructor(private readonly buyerLeadsService: BuyerLeadsService) {
        this.router = express.Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {

        this.router.get("/admin", async (req: Request, res: Response) => {
            const { limit, page } = req.query
            const response = await this.buyerLeadsService.getAll(limit as string, page as string);
            res.status(200).send(response);
        });

        this.router.get("/", async (req: Request, res: Response) => {
            const { id } = req.user
            const { limit, page, get_archived , search, counties, dateRange } = req.query
            const response = await this.buyerLeadsService.getUserLeads(id, get_archived as string, limit as string, page as string, search as string, counties as string, dateRange as string);
            res.status(200).send(response);
        });

        this.router.get("/buyer/admin/:buyerID", async (req: Request, res: Response) => {
            const { buyerID, search, counties, dateRange } = req.params
            const { limit, page, get_archived } = req.query
            const response = await this.buyerLeadsService.getAllBuyerLeadsByBuyer(buyerID, get_archived as string, limit as string, page as string, search as string, counties as string, dateRange as string);
            res.status(200).send(response);
        });

        // get one Buyer_leads from db by Buyer_leads.id by buyer
        this.router.get("/:buyerLeadId", async (req: Request, res: Response) => {
            const { buyerLeadId } = req.params
            const user_id = req.user.id
            if (!user_id) {
                res.status(401).send({ message: "Unauthorized" });
                return;
            }
            const response = await this.buyerLeadsService.getOneByID(buyerLeadId);
            res.status(200).send(response);
        });

        // get one Buyer_leads from db by id
        this.router.get("/admin/get-by-id", async (req: Request, res: Response) => {
            const { buyer_lead_id } = req.query
            const response = await this.buyerLeadsService.getOneByID(buyer_lead_id as string);
            res.status(200).send(response);
        });

        // TODO Creates Buyer_leads in db
        this.router.post("/admin/create", async (req: Request, res: Response) => {
            const newBuyerLead = req.body
            const response = await this.buyerLeadsService.createBuyerLead(newBuyerLead);
            res.status(200).send(response);
        });

        // Updates Buyer_leads in db
        this.router.put("/admin/update", async (req: Request, res: Response) => {
            const updatedData = req.body
            const response = await this.buyerLeadsService.update(updatedData.id, updatedData);
            res.status(200).send(response);
        });

        // Deletes Buyer_leads in db
        this.router.delete("/admin/:buyerLeadId", async (req: Request, res: Response) => {
            const { buyerLeadId } = req.params
            const response = await this.buyerLeadsService.deleteBuyerLead(buyerLeadId);
            res.status(200).send(response);
        });
        
    }

    public routes(): Router {
        return this.router;
    }
}