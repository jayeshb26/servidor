import { PlanFeature } from "./plan-feature.models";

export class Plan {
    id: number;
    slug: string;
    name: string;
    description: string;
    is_active: boolean;
    price: number;
    priceToShow: string;
    signup_fee: number;
    currency: string;
    trial_interval: string;
    invoice_interval: string;
    grace_interval: string;
    prorate_day: string;
    prorate_period: string;
    prorate_extend_due: string;
    active_subscribers_limit: string;
    updated_at: string;
    created_at: string;
    trial_period: number;
    invoice_period: number;
    grace_period: number;
    sort_order: number;
    features: Array<PlanFeature>;
}