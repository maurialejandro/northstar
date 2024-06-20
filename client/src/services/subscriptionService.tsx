import { authProvider, AxiosProvider } from "../config/axiosProvider.ts";
import { Subscription, SubscriptionLevel } from "../types/subscriptionTypes.ts";

export class DisputeService {

    constructor(private readonly api: AxiosProvider) {}

    getById = async (): Promise<Subscription | null> => {
        return await this.api.getApi().get(`/api/subscription`).then((response) => response.data).catch(()=> {
            return null
        });
    };

    getSubscriptionLevels = async (): Promise<SubscriptionLevel[]> => {
        return await this.api.getApi().get(`/api/subscription/levels`).then((response) => response.data);
    }

    postSubscription = async (subscription_level_id: string): Promise<Subscription> => {
        return await this.api.getApi().post(`/api/subscription`, { subscription_level_id }).then((response) => response.data);
    }

    pauseSubscription = async (subscription_id:string): Promise<Subscription> => {
        return await this.api.getApi().put(`/api/subscription/pause`, { subscription_id }).then((response) => response.data);
    }

    resumeSubscription = async (subscription_id:string): Promise<Subscription> => {
        return await this.api.getApi().put(`/api/subscription/resume`, { subscription_id }).then((response) => response.data);
    }

    upgradeSubscription = async (data:{ subscription_level_id: string }): Promise<Subscription> => {
        return await this.api.getApi().post(`/api/subscription/upgrade`, data).then((response) => response.data);
    }

    upgradeSubscriptionData = async (): Promise<{subscriptionPeriod: { period: number, daysLeft: number, daysPassed: number }, upgradeChargeAndCredits: { charge: number, credit: number }}> => {
        return await this.api.getApi().get(`/api/subscription/upgrade`).then((response) => response.data);
    }

}

const disputeService = new DisputeService(authProvider);

export default disputeService;