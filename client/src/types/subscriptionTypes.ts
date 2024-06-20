import { User } from "./userTypes.ts";

export type Subscription = {
    id: string
    user_id: string
    type: string
    subscription_level_id: string
    start_date: Date
    end_date: Date
    can_renew: boolean
    subscription_levels: SubscriptionLevel
    users: User
}

export type SubscriptionLevel = {
    id: string
    level: string
    charge: number
    credit: number
}