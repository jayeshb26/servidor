export class PlanDetail {
    leads_remaining_for_today: number;
    remaining_days_count: number;
    active: boolean;
    ends_at: string;
    starts_at: string;
    subscription: any;

    static default(): PlanDetail {
        let pd = new PlanDetail();
        pd.leads_remaining_for_today = 0;
        pd.remaining_days_count = 0;
        return pd;
    }
}