import express, { Request, Response, Router } from 'express';
import CountyBidsService from '../services/countyBidsService';
import { injectable } from "tsyringe";
import { Buyer } from '../types/buyerTypes';
import BuyerLeadsService from '../services/buyerLeadsService';

@injectable()
export default class CountyBidsResource {

    private readonly router: Router;
    private readonly buyerLeadsService: BuyerLeadsService;
    constructor(private readonly countyBidsService: CountyBidsService, buyerLeadsService: BuyerLeadsService) {
        this.router = express.Router();
        this.countyBidsService = countyBidsService;
        this.buyerLeadsService = buyerLeadsService;
        this.initializeRoutes();
    }

    private initializeRoutes() {
        //Gets county_bids from DB
        this.router.get("/admin/all", async (req: Request, res: Response) => {
            const { limit, page, search, counties } = req.query
            const response = await this.countyBidsService.getCountyBids(limit as string, page as string, search as string, counties as string);
            res.status(200).send(response);
        });

       this.router.get("/by_user", async (req: Request, res: Response) => {
   
        const { id } = req.user!;
        if (!id) {
          res.status(401).send({ message: "Unauthorized" });
          return;
        }
        const response = await this.countyBidsService.getCountyBidsByBuyer(id);

        res.status(200).send(response);
       });
        
        this.router.get("/admin/:id", async (req: Request, res: Response) => {
            const { id } = req.params
            const response = await this.countyBidsService.getCountyBidsByBuyer(id);

            res.status(200).send(response);
        });

        this.router.get("/admin/by_county/:county_id", async (req: Request, res: Response) => {
            const { county_id } = req.params
            const response = await this.countyBidsService.getCountyBidsByCounty(county_id);
            res.status(200).send(response);
        });

        // Creates County_bids in db
        this.router.post("/create", async (req: Request, res: Response) => {
            const { id } = req.user
            const { county_id, bid_amount } = req.body
            const response = await this.countyBidsService.create(id, county_id, bid_amount);
            res.status(200).send(response);
        });

        // Updates County_bids in db
        this.router.put("/update", async (req: Request, res: Response) => {
            const user_id = req.user.id;
            const { id, updatedData } = req.body;
            if (!user_id) {
                res.status(400).send({ message: "Unauthorized" });
                return;
            }
            const response = await this.countyBidsService.update(id, { ...updatedData, user_id });
            res.status(200).send(response);
        });

        // Bulk Deletes County_bids in db
        this.router.put("/bulk_delete", async (req: Request, res: Response) => {
            const user_id = req.user.id;
            const { ids } = req.body
            if (!user_id) {
                res.status(400).send({ message: "Unauthorized" });
                return;
            }
            const response = await this.countyBidsService.bulkDelete(ids);
            res.status(200).send(response);
        });

        // Gets all states
        this.router.get("/states", async (_req: Request, res: Response) => {
            const response = await this.countyBidsService.getAllStates();
            res.status(200).send(response);
        }
        );

        // Gets counties filtered by state
        this.router.get("/counties/:state", async (req: Request, res: Response) => {
          const { state } = req.params
          const response = await this.countyBidsService.getCountiesByState(state);
          res.status(200).send(response);
        }
        );

        this.router.get("/counties", async (_req: Request, res: Response) => {
                const response = await this.countyBidsService.getAllCounties();
                res.status(200).send(response);
            }
      );

      //get county by id
      this.router.get("/counties_by_id/:id", async (req: Request, res: Response) => {
        const { id } = req.params
        const response = await this.countyBidsService.countyBidsById(id);
        res.status(200).send(response);
      }
      );
      
        this.router.post("/admin/by_lead", async (req: Request, res: Response) => {
            const { body } = req
            const leads = [body]
            const countyBids = []
            const blackList: Partial<Buyer>[] = [];

            for (let i = 0; i < 3; i++) {
                const response = await this.buyerLeadsService.getNominatedBuyerForLeads(leads, [] ,blackList);
                const user_id = response[0]?.user_id
                if (user_id) {
                    blackList.push({user_id});
                }
                countyBids.push(response[0])
            }
            res.status(200).send(countyBids);
        });
        
        this.router.get("/by_id/:id", async (req: Request, res: Response) => {
            const user_id = req.user.id;
            const { id } = req.params
            if (!user_id) {
                res.status(400).send({ message: "Unauthorized" });
                return;
            }
            const response = await this.countyBidsService.countyBidsById(id);
            res.status(200).send(response);
        });
  }
  
    public routes(): Router {
      return this.router;
    }
}