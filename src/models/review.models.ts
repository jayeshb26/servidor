import { Profile } from "./profile.models";
import { User } from "./user.models";

export class Review {
    id: number;
    rating: number;
    review: string;
    created_at: string;
    user: User;
    provider: Profile;
}