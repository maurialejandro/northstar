import express, { Request, Response, Router } from 'express';
import { injectable } from "tsyringe";
import CountyBidsService from '../services/countyBidsService';
import BuyerService from '../services/buyerService';

@injectable()
export default class WinRateResource {

    private readonly router: Router;

    constructor(private readonly countyBidsService: CountyBidsService, private readonly buyerService: BuyerService) {
        this.router = express.Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {

        this.router.get('/by_bid', async (req: Request, res: Response) => {
            const { state, county, bid_amount } = req.query;

            const user_id = req.user.id
            const user = await this.buyerService.getBuyerById(user_id)
            const counties = await this.countyBidsService.getCountiesByState(state as string)
            const newBid = {
                county,
                bid_amount: parseInt(bid_amount as string),
                user_id,
                counties: counties[0],
                users: user!,
                county_id: counties[0].id,
            }
            const response = await this.countyBidsService.winRateForBid(newBid, user_id, true);
            const winRate = response.win_rate
            res.status(200).json({ win_rate: winRate })
        });

    }

    public routes(): Router {
        return this.router;
    }
}