import { authProvider, AxiosProvider } from "../config/axiosProvider.ts";

class WinRateService {

    constructor(private readonly api: AxiosProvider) {}

    getWinRate = async (state: string, county: string, bid_amount: number): Promise<{ win_rate : number }> => {
        return await this.api.getApi().get(`/api/win_rate/by_bid?state=${state}&county=${county}&bid_amount=${bid_amount}`).then(response => response.data);
    };

}

const winRateService = new WinRateService(authProvider);

export default winRateService;