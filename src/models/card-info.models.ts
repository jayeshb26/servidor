export class CardInfo {
    name: string;
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;

    areFieldsFilled() {
        return ((this.name && this.name.length)
            &&
            (this.number && this.number.length > 10)
            &&
            (this.expMonth && this.expMonth <= 12 && this.expMonth >= 1)
            &&
            (this.expYear && this.expYear <= 99)
            &&
            (this.cvc && this.cvc.length == 3));
    }
}