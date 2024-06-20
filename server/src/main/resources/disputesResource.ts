import express, { Request, Response, Router } from 'express';
import DisputesService from '../services/disputesService';
import { injectable } from "tsyringe";

@injectable()
export default class DisputesResource {

    private readonly router: Router;

    constructor(private readonly disputesService: DisputesService) {
        this.router = express.Router();
        this.disputesService = disputesService;
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Admin gets all Disputes from DB
        this.router.get("/admin", async (req: Request, res: Response) => {
            const { limit, page, search, status, dateRange } = req.query
            const response =
                await this.disputesService.getAll(limit as string, page as string, search as string,
                    status as string, dateRange as string);
            res.status(200).send(response)
        });

        // TODO Creates Disputes in db
        this.router.post("/create", async (req: Request, res: Response) => {
            const {id} =req.user
            const { buyer_lead_id, dispute_reason, dispute_message } = req.body
            const userOwnsBuyerLead = await this.disputesService.userOwnsBuyerLead(id, buyer_lead_id)
            if(!userOwnsBuyerLead) return res.sendStatus(403)
            const response = await this.disputesService.create(buyer_lead_id, dispute_reason, dispute_message);
            res.status(200).send(response)
        });

        // Admin Updates Disputes in db
        this.router.put("/admin/deny", async (req: Request, res: Response) => {
            const { id } = req.body
            const disputeStatus = await this.disputesService.checkStatusById(id)
            if (disputeStatus === 'Rejected') return res.sendStatus(406)
            const response = await this.disputesService.update(id, { status: 'Rejected' });
            res.status(200).send(response)
        });

        // Admin approves Disputes in db
        this.router.put("/admin/approve", async (req: Request, res: Response) => {
            const { id, buyer_lead_id } = req.body
            const disputeStatus = await this.disputesService.checkStatusById(id)
            if (disputeStatus === 'Approved') return res.sendStatus(406)
            const response = await this.disputesService.approveDispute(id, buyer_lead_id);
            res.status(200).send(response)
        });

        // Deletes Disputes in db
        this.router.delete("/admin/delete/:id", async (req: Request, res: Response) => {
            const { id } = req.params
            const disputeStatus = await this.disputesService.getDisputeById(id)
            if (disputeStatus.deleted !== null) return res.sendStatus(406)
            const response = await this.disputesService.delete(id);
            res.status(200).send(response)
        });
      
        this.router.get("/dispute-rate", async (req: Request, res: Response) => {
            const { id } = req.user!
            const response = await this.disputesService.getDisputeRate(id);
            res.status(200).send(response);
        });

        this.router.get("/avarege-dispute", async (_req: Request, res: Response) => {
            const response = await this.disputesService.getCalculatedAverageDisputeRate();
            res.status(200).send(response);
        });
    }

    public routes(): Router {
        return this.router;
    }
}
