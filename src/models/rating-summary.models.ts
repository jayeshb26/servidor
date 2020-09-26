export class RatingSummary {
    total: number;
    percent: number;
    rounded_rating: number;

    constructor(total: number, percent: number, rounded_rating: number) {
        this.total = total;
        this.percent = percent;
        this.rounded_rating = rounded_rating;
    }

    static defaultArray(): Array<RatingSummary> {
        let ratingSummaries = new Array<RatingSummary>();
        for (let i = 0; i < 5; i++) {
            ratingSummaries.push(new RatingSummary(0, 0, i));
        }
        return ratingSummaries;
    }
}