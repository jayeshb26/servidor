export class SignUpRequest {
    name: string;
    email: string;
    password: string;
    mobile_number: string;
    role: string;

    constructor(name: string, email: string, password: string, mobile_number: string) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.mobile_number = mobile_number;
        this.role = "provider";
    }
}