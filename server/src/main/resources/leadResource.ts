import express, { Request, Response, Router } from 'express';
import LeadService from '../services/leadService';
import { injectable } from "tsyringe";

@injectable()
export default class LeadsResource {

    private readonly router: Router;

    constructor(private readonly leadService: LeadService) {

        this.router = express.Router();
        this.leadService = leadService;
        this.initializeRoutes();
    }

    private initializeRoutes() {

        this.router.post('/create/admin', async (req: Request, res: Response) => {
            const newLead = req.body;
            const response = await this.leadService.createLead(newLead);
            res.status(200).send(response);

        });

        this.router.get("/admin", async (req: Request, res: Response) => {
            const { limit, page } = req.query
            const response = await this.leadService.getAllLeads(limit as string, page as string);
            res.status(200).send(response);
        });

        this.router.post('/admin/import-data', async (req: Request, res: Response) => {
            // TODO: add uploaded by user id, maybe format the leads on the front end
            const data = req.body;
            const adminId = req.user.id
            const response = await this.leadService.insertManyLeads(data, adminId);
            res.status(response.status).send(response.data);
        });

        this.router.delete('/:leadId', async (req: Request, res: Response) => {
            const { leadId } = req.params
            const response = await this.leadService.deleteLead(leadId);
            res.status(200).send(response);
        });

        this.router.patch('/:leadId/undelete', async (req: Request, res: Response) => {
            const { leadId } = req.params
            const response = await this.leadService.undeleteLead(leadId);
            res.status(200).send(response);
        });

        this.router.get('/admin/:leadId', async (req: Request, res: Response) => {
            const { leadId } = req.params
            const response = await this.leadService.getLeadById(leadId);
            res.status(200).send(response);
        });

        this.router.put('/:leadId', async (req: Request, res: Response) => {
            const { leadId } = req.params
            const updatedData = req.body
            const response = await this.leadService.updateLead(leadId, updatedData);
            res.status(200).send(response);
        });

        this.router.post('/create/label', async (req: Request, res: Response) => {
            const { id } = req.user
            const { color, text } = req.body
            const response = await this.leadService.createLeadLabel(id, color, text);
            res.status(200).send(response);
        })

        this.router.get('/labels', async (req: Request, res: Response) => {
            const { id } = req.user
            const response = await this.leadService.getLeadLabels(id);
            res.status(200).send(response);
        })

        this.router.delete('/label/:labelId', async (req: Request, res: Response) => {
            const { id } = req.user
            const { labelId } = req.params
            const response = await this.leadService.deleteLeadLabel(id,labelId);
            if(response === null) {
                return res.status(403).send({message: "You do not have permission to update this label"})
            }
            res.status(200).send(response);
        })

        this.router.put('/update/label', async (req: Request, res: Response) => {
            const user_id= req.user.id
            const { id, color, text } = req.body
            const response = await this.leadService.updateLeadLabel(user_id, id, {color, text});
            if(response === null) {
                return res.status(403).send({message: "You do not have permission to update this label"})
            }
            res.status(200).send(response);
        })

        this.router.put('/label/assign', async (req: Request, res: Response) => {
            const { label_id, lead_id } = req.body
            const response = await this.leadService.assignLabelToLead(label_id, lead_id);
            res.status(200).send(response);
        })

        this.router.put('/label/remove', async (req: Request, res: Response) => {
            const { lead_id } = req.body
            const response = await this.leadService.removeLabelFromLead(lead_id);
            res.status(200).send(response);
        })
      
        this.router.get('/label/colors', async (_req: Request, res: Response) => {
            const response = await this.leadService.getAllLabelColors();
            res.status(200).send(response);
        })
    }

    public routes(): Router {
        return this.router;
    }
}
