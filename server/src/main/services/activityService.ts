import { injectable } from "tsyringe";
import { Activity } from '../types/activityTypes';
import ActivityDAO from '../data/activityDAO';

@injectable()

export default class ActivityService {

    constructor(private readonly activityDAO: ActivityDAO) {
        this.activityDAO = activityDAO;
    }

    async getByLeadId(leadId: string, userId: string): Promise<Activity[]> {
        const res = await this.activityDAO.getByLeadId(leadId)
        const filteredActivities = res.filter((activity: Activity) => {
            return !(activity.user_id !== userId && activity.visibility === 'private');
        });

        return filteredActivities;
        
    }

    async create(leadId: string, userId: string, visibility: string, note: string): Promise<Activity> {
        return await this.activityDAO.create(leadId, userId, visibility, note);
    }

    async update(activityId: string, update: Partial<Activity>): Promise<Activity> {
        return await this.activityDAO.update(activityId, update);
    }

    async delete(id: string): Promise<Activity> {
        return await this.activityDAO.delete(id);
    }
}