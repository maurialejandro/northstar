import express, { Request, Response, Router } from 'express';
import { injectable } from "tsyringe";
import ActivityService from '../services/activityService';

@injectable()
export default class ActivityResource {
    private readonly router: Router;

    constructor(private readonly activityService: ActivityService) {
        this.router = express.Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {

        this.router.get("/admin/by_lead/:leadId", async (req: Request, res: Response) => {
            const { leadId } = req.params
            const userId = req.user.id;
            const response = await this.activityService.getByLeadId(leadId, userId);
            res.status(200).send(response);
        });

        this.router.post("/admin/create", async (req: Request, res: Response) => {
            const { leadId, visibility, note } = req.body;
            const userId = req.user.id;
            const response = await this.activityService.create(leadId, userId, visibility, note);
            res.status(200).send(response);
        });

        this.router.put("/admin/update/:activityId", async (req: Request, res: Response) => {
            const { activityId } = req.params;
            const note = req.body;
            const response = await this.activityService.update(activityId, note);
            res.status(200).send(response);
        });

        this.router.delete("/admin/delete/:activityId", async (req: Request, res: Response) => {
            const { activityId } = req.params;
            const response = await this.activityService.delete(activityId);
            res.status(200).send(response);
        });
    }
    
    public routes(): Router {
        return this.router;
    }
}