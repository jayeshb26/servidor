import { RatingSummary } from "./rating-summary.models";

export class Rating {
    average_rating: string;
    total_ratings: number;
    total_completed: number;
    summary: Array<RatingSummary>;

    static getDefault() {
        let toReturn = new Rating();
        toReturn.average_rating = "0";
        toReturn.total_completed = 0;
        toReturn.total_ratings = 0;
        toReturn.summary = RatingSummary.defaultArray();
        return toReturn;
    }
}