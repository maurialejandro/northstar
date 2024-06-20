import { authProvider, AxiosProvider } from "../config/axiosProvider.ts";
import { Activity } from '../types/activityType.ts';

class ActivityService {

    constructor(private readonly api: AxiosProvider) {}

    getByLeadId = async (leadId: string): Promise<Activity[]> => {
        return await this.api.getApi().get(`/api/activity/admin/by_lead/${leadId}`).then(response => response.data);
    };

    createActivity = async (activity: Partial<Activity>): Promise<Activity[]> => {
        return await this.api.getApi().post(`/api/activity/admin/create`, activity).then(response => response.data);
    };

    deleteActivity = async (activityId: string): Promise<Activity[]> => {
        return await this.api.getApi().delete(`/api/activity/admin/delete/${activityId}`).then(response => response.data);
    };

    updateActivity = async (activityId : string, note: Partial<Activity>): Promise<Activity[]> => {
        return await this.api.getApi().put(`/api/activity/admin/update/${activityId}`, note).then(response => response.data);
    };

}

const activityService = new ActivityService(authProvider);

export default activityService;