import { Category } from "./category.models";
import { User } from "./user.models";

export class Profile {
    id: number;
    primary_category_id: number;
    user_id: number;
    is_verified: number;
    price: number;
    document_url: string;
    price_type: string;
    address: string;
    about: string;
    latitude: string;
    longitude: string;
    user: User;
    primary_category: Category;
    subcategories: Array<Category>;
    ratings: any;
}