export class Payment {
    id: number;
    order_ids: string;
    total: number;
    paid: number;
    remain: number;
    method: string;
    status: string;
    appointment_id: number;
    user_id: number;
}