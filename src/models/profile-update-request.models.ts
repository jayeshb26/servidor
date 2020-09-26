export class ProfileUpdateRequest {
    primary_category_id: number;
    price: number;
    price_type: string;
    document_url: string;
    address: string;
    longitude: string;
    latitude: string;
    about: string;
    sub_categories: Array<number>;
}